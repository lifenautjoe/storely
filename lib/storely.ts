import {
    IStorelyEventDispatchStrategy, IStorely, IStorelyStoreStrategy,
    IStorelyValueChangeDetectionStrategy, IStorelyConfig, IStorelyKeyManagerStrategy, IStorelyKeyManagerConfig
} from './storely-interfaces';
import {StorelyConfigurationError} from './storely-errors';
import {
    ClearedListener,
    ChangedListener,
    EventListenerRemover,
    KeyValueChangedListener,
    KeyValueRemovedListener
} from './storely-types';

export class Storely implements IStorely {
    private keyManagerStrategyConstructor: new (config: IStorelyKeyManagerConfig) => IStorelyKeyManagerStrategy;
    private storeStrategy: IStorelyStoreStrategy;
    private eventDispatchStrategy: IStorelyEventDispatchStrategy;
    private valueChangeDetectionStrategy: IStorelyValueChangeDetectionStrategy;
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

    constructor(config: IStorelyConfig) {
        if (!config.storeStrategy) throw new StorelyConfigurationError('config.storeStrategy is required');
        this.storeStrategy = config.storeStrategy;

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

    getOrSet(key: string, value: any) {
        const existingValue = this.get(key);
        if (existingValue) return existingValue;
        this.set(key, value);
        return value;
    }

    get(key: string): any {
        const namespacedKey = this.namespace + key;
        return this.getFromStore(namespacedKey);
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

    getKeyManagerForKey(key: string): IStorelyKeyManagerStrategy {
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
        this.storeStrategy.set(key, value);
    }

    private removeFromStore(key: string): void {
        this.storeStrategy.remove(key);
    }

    private getFromStore(key: string): any {
        return this.storeStrategy.get(key);
    }

    private getAllFromStore(): Object {
        return this.storeStrategy.getAll();
    }

    private clearStore(): void {
        this.storeStrategy.clear();
    }

    private getStoreKeys(): Array<string> {
        return this.storeStrategy.getKeys();
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
