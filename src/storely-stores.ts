import {
    StorelyEventDispatchStrategy,
    StorelyStore,
    StorelyStorageStrategy,
    StorelyValueChangeDetectionStrategy,
    StorelyStoreConfig,
    StorelyStoreItemConfig,
    StorelyStoreGetConfig, StorelyStoreItem, StorelyStoreGetItemConfig
} from './storely-interfaces';
import {StorelyConfigurationError} from './storely-errors';
import {
    ClearedListener,
    ChangedListener,
    EventListenerRemover,
    KeyValueChangedListener,
    KeyValueRemovedListener, EventDispatchStrategyListener
} from './storely-types';

export class StorelyStoreImp implements StorelyStore {
    private static readonly constants = {
        events: {
            CUSTOM_PREFIX: 'customEvent',
            CHANGED: 'wasChanged',
            CLEARED: 'wasCleared',
            value: {
                REMOVED: 'valueRemoved',
                CHANGED: 'valueChanged'
            }
        }
    };
    private storeItemConstructor: new (config: StorelyStoreItemConfig) => StorelyStoreItem;
    private storageStrategy: StorelyStorageStrategy;
    private eventDispatchStrategy: StorelyEventDispatchStrategy;
    private valueChangeDetectionStrategy: StorelyValueChangeDetectionStrategy;
    private namespace: string;

    constructor(config: StorelyStoreConfig) {
        if (!config.storageStrategy) throw new StorelyConfigurationError('config.storageStrategy is required');
        this.storageStrategy = config.storageStrategy;

        if (!config.storeItemConstructor) throw new StorelyConfigurationError('config.storeItemConstructor is required');
        this.storeItemConstructor = config.storeItemConstructor;

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

    onItemValueChanged(key: string, keyValueChangedListener: KeyValueChangedListener): EventListenerRemover {
        const namespacedKey = this.namespace + key;
        const eventIdentifier = this.makeKeyValueChangedEventIdentifier(namespacedKey);
        return this.eventDispatchStrategy.on(eventIdentifier, keyValueChangedListener);
    }

    onItemValueRemoved(key: string, keyValueRemovedListener: KeyValueRemovedListener): EventListenerRemover {
        const namespacedKey = this.namespace + key;
        const eventIdentifier = this.makeKeyValueRemovedEventIdentifier(namespacedKey);
        return this.eventDispatchStrategy.on(eventIdentifier, keyValueRemovedListener);
    }

    onCleared(clearedListener: ClearedListener): EventListenerRemover {
        return this.eventDispatchStrategy.on(StorelyStoreImp.constants.events.CLEARED, clearedListener);
    }

    onChanged(changedListener: ChangedListener): EventListenerRemover {
        return this.eventDispatchStrategy.on(StorelyStoreImp.constants.events.CHANGED, changedListener);
    }

    getItem(key: string, config?: StorelyStoreGetItemConfig): StorelyStoreItem {
        const storeItemConfig = Object.assign({
            storely: this,
            key
        }, config);
        return new this.storeItemConstructor(storeItemConfig);
    }

    mergeEventRemovers(...eventRemovers: Array<EventListenerRemover>): EventListenerRemover {
        return () => {
            eventRemovers.forEach(eventRemover => eventRemover());
        };
    }

    emit(eventIdentifier: string, ...eventData): void {
        const eventName = this.makeCustomEventIdentifier(eventIdentifier);
        this.eventDispatchStrategy.emit(eventName, ...eventData);
    }

    on(eventIdentifier: string, listener: EventDispatchStrategyListener): EventListenerRemover {
        const eventName = this.makeCustomEventIdentifier(eventIdentifier);
        return this.eventDispatchStrategy.on(eventName, listener);
    }

    private makeCustomEventIdentifier(eventName: string): string {
        return `${StorelyStoreImp.constants.events.CUSTOM_PREFIX}-${eventName}`;
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
        const eventIdentifier = StorelyStoreImp.constants.events.CLEARED;
        this.eventDispatchStrategy.emit(eventIdentifier);
        this.emitChanged();
    }

    private emitChanged(): void {
        const eventIdentifier = StorelyStoreImp.constants.events.CHANGED;
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
        return `${key}.${StorelyStoreImp.constants.events.value.CHANGED}`;
    }

    private makeKeyValueRemovedEventIdentifier(key) {
        return `${key}.${StorelyStoreImp.constants.events.value.REMOVED}`;
    }
}
