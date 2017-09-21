import {
    StorelyEventDispatchStrategy, StorelyStore, StorelyStorageStrategy,
    StorelyValueChangeDetectionStrategy, StorelyStoreConfig, StorelyKeyManagerStrategy, StorelyStoreKeyManagerConfig, StorelyStoreGetConfig
} from './storely-interfaces';
import {StorelyConfigurationError} from './storely-errors';
import {
    ClearedListener,
    ChangedListener,
    EventListenerRemover,
    KeyValueChangedListener,
    KeyValueRemovedListener
} from './storely-types';

export class StorelyStoreImp implements StorelyStore {
    private keyManagerStrategyConstructor: new (config: StorelyStoreKeyManagerConfig) => StorelyKeyManagerStrategy;
    private storageStrategy: StorelyStorageStrategy;
    private eventDispatchStrategy: StorelyEventDispatchStrategy;
    private valueChangeDetectionStrategy: StorelyValueChangeDetectionStrategy;
    private namespace: string;

    readonly constants = {
        events: {
            CHANGED: 'wasChanged',
            CLEARED: 'wasCleared',
            value: {
                REMOVED: 'valueRemoved',
                CHANGED: 'valueChanged'
            }
        }
    };

    constructor(config: StorelyStoreConfig) {
        if (!config.storageStrategy) throw new StorelyConfigurationError('config.storageStrategy is required');
        this.storageStrategy = config.storageStrategy;

        if (!config.keyManagerStrategyConstructor) throw new StorelyConfigurationError('config.keyManagerStrategyConstructor is required');
        this.keyManagerStrategyConstructor = config.keyManagerStrategyConstructor;

        if (!config.eventDispatchStrategy) throw new StorelyConfigurationError('config.eventDispatchStrategy is required');
        this.eventDispatchStrategy = config.eventDispatchStrategy;

        if (!config.valueChangeDetectionStrategy) throw new StorelyConfigurationError('config.valueChangeDetectionStrategy is required');
        this.valueChangeDetectionStrategy = config.valueChangeDetectionStrategy;

        this.namespace = config.namespace ? `${config.namespace}-` : '';
    }

    set(key: string, value: any, config = {shouldEmit: true}) {
        const namespacedKey = this.namespace + key;
        const previousValue = this.getFromStore(namespacedKey);
        if (!this.valueHasChanged(value, previousValue)) return;

        this.setInStore(namespacedKey, value);
        if (config.shouldEmit) {
            this.emitKeyValueChanged(namespacedKey, value, previousValue);
        }
    }

    remove(key: string, config = {shouldEmit: true}): void {
        const namespacedKey = this.namespace + key;
        const value = this.getFromStore(namespacedKey);
        if (!value) return;

        this.removeFromStore(namespacedKey);
        if (config.shouldEmit) {
            this.emitKeyValueRemoved(namespacedKey, value);
        }
    }

    get(key: string, config?: StorelyStoreGetConfig): any {
        const namespacedKey = this.namespace + key;
        const existingValue = this.getFromStore(namespacedKey);
        if (typeof existingValue !== 'undefined') return existingValue;
        if (config && typeof config.defaultValue !== 'undefined') {
            const defaultValue = config.defaultValue;
            this.set(key, defaultValue);
            return defaultValue;
        }
    }

    getAll(): Object {
        return this.getAllFromStore();
    }

    clear(config = {shouldEmit: true, shouldEmitIndividually: false}): void {
        config.shouldEmit && config.shouldEmitIndividually ? this.normalClear() : this.fastClear();
        if (config.shouldEmit) this.emitCleared();
    }

    onKeyValueChanged(key: string, keyValueChangedListener: KeyValueChangedListener): EventListenerRemover {
        const namespacedKey = this.namespace + key;
        const eventIdentifier = this.makeKeyValueChangedEventIdentifier(namespacedKey);
        return this.eventDispatchStrategy.on(eventIdentifier, keyValueChangedListener);
    }

    onKeyValueRemoved(key: string, keyValueRemovedListener: KeyValueRemovedListener): EventListenerRemover {
        const namespacedKey = this.namespace + key;
        const eventIdentifier = this.makeKeyValueRemovedEventIdentifier(namespacedKey);
        return this.eventDispatchStrategy.on(eventIdentifier, keyValueRemovedListener);
    }

    onCleared(clearedListener: ClearedListener): EventListenerRemover {
        return this.eventDispatchStrategy.on(this.constants.events.CLEARED, clearedListener);
    }

    onChanged(changedListener: ChangedListener): EventListenerRemover {
        return this.eventDispatchStrategy.on(this.constants.events.CHANGED, changedListener);
    }

    getKeyManagerForKey(key: string): StorelyKeyManagerStrategy {
        return new this.keyManagerStrategyConstructor({
            storely: this,
            key
        });
    }

    mergeEventRemovers(...eventRemovers: Array<EventListenerRemover>): EventListenerRemover {
        return () => {
            eventRemovers.forEach(eventRemover => eventRemover());
        };
    }

    /**
     * Sacrifices not emiting keyValueChanged for all cleared items for performance
     */
    private fastClear() {
        this.clearStore();
    }

    private normalClear() {
        const storeKeys = this.getStoreKeys();
        storeKeys.forEach(storeKey => this.remove(storeKey));
    }

    private setInStore(key: string, value: any): void {
        this.storageStrategy.set(key, value);
    }

    private removeFromStore(key: string): void {
        this.storageStrategy.remove(key);
    }

    private getFromStore(key: string): any {
        return this.storageStrategy.get(key);
    }

    private getAllFromStore(): Object {
        return this.storageStrategy.getAll();
    }

    private clearStore(): void {
        this.storageStrategy.clear();
    }

    private getStoreKeys(): Array<string> {
        return this.storageStrategy.getKeys();
    }

    private emitCleared(): void {
        const eventIdentifier = this.constants.events.CLEARED;
        this.eventDispatchStrategy.emit(eventIdentifier);
        this.emitChanged();
    }

    private emitChanged(): void {
        const eventIdentifier = this.constants.events.CHANGED;
        this.eventDispatchStrategy.emit(eventIdentifier);
    }

    private emitKeyValueChanged(key: string, newValue: any, previousValue: any): void {
        const eventIdentifier = this.makeKeyValueChangedEventIdentifier(key);
        this.eventDispatchStrategy.emit(eventIdentifier, newValue, previousValue);
    }

    private emitKeyValueRemoved(key: string, lastValue: any): void {
        const eventIdentifier = this.makeKeyValueRemovedEventIdentifier(key);
        this.eventDispatchStrategy.emit(eventIdentifier, lastValue);
    }

    private valueHasChanged(newValue: any, previousValue: any): boolean {
        return this.valueChangeDetectionStrategy.valueChanged(newValue, previousValue);
    }

    private makeKeyValueChangedEventIdentifier(key) {
        return `${key}.${this.constants.events.value.CHANGED}`;
    }

    private makeKeyValueRemovedEventIdentifier(key) {
        return `${key}.${this.constants.events.value.REMOVED}`;
    }
}
