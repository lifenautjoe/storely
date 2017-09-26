/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {
    ClearedListener,
    ChangedListener,
    EventListenerRemover,
    KeyValueChangedListener,
    KeyValueRemovedListener, EventDispatchStrategyListener
} from './storely-types';


export interface StorelyStore {
    set(key: string, value: any, config?: StorelyStoreSetConfig);

    remove(key: string): void;

    get(key: string, config?: StorelyStoreGetConfig): any;

    getAll(): Object;

    clear(): void;

    onKeyValueChanged(key: string, keyValueChangedListener: KeyValueChangedListener): EventListenerRemover;

    onKeyValueRemoved(key: string, keyValueRemovedListener: KeyValueRemovedListener): EventListenerRemover;

    onCleared(clearedListener: ClearedListener): EventListenerRemover;

    onChanged(clearedListener: ChangedListener): EventListenerRemover;

    getManagerForKey(key: string): StorelyKeyManagerStrategy;

    mergeEventRemovers(...eventRemovers: Array<EventListenerRemover>): EventListenerRemover;
}

/**
 * Manages an specific key within storely
 */
export interface StorelyKeyManager {
    set(value: any, config?: StorelyStoreSetConfig);

    get(config?: StorelyStoreGetConfig): any;

    remove(): void;

    onValueChanged(keyValueChangedListener: KeyValueChangedListener);

    onValueRemoved(keyValueRemovedListener: KeyValueRemovedListener);
}

export interface StorelyKeyManagerStrategy extends StorelyKeyManager {

}


export interface StorelyStoreConfig {
    namespace?: string;
    eventDispatchStrategy: StorelyEventDispatchStrategy;
    storageStrategy: StorelyStorageStrategy;
    valueChangeDetectionStrategy: StorelyValueChangeDetectionStrategy;
    keyManagerStrategyConstructor: any;
}

export interface StorelyValueChangeDetectionStrategy {
    valueChanged(newValue: any, oldValue: any): boolean;
}

export interface StorelyEventDispatchStrategy {
    emit(eventIdentifier: string, ...eventData): void;

    on(eventIdentifier: string, listener: EventDispatchStrategyListener): EventListenerRemover;
}

// Yeah.. I know...
export interface StorelyStorageStrategy {

    getAll(): Object;

    get(key: string): any;

    set(key: string, value: Object);

    remove(key: string): void;

    clear(): void;

    getKeys(): Array<string>;
}

/**
 * I could not find a way to specify a constructor type for an interface
 */
export interface StorelyStoreFactoryConfig {
    namespace?: string;
    eventDispatchStrategyConstructor: any;
    storageStrategyConstructor: any;
    valueChangeDetectionStrategyConstructor: any;
    keyManagerStrategyConstructor: any;
}


export interface StorelyMakeConfig {
    namespace?: string;
    eventDispatchStrategy?: StorelyEventDispatchStrategy;
    storageStrategy?: StorelyStorageStrategy;
    valueChangeDetectionStrategy?: StorelyValueChangeDetectionStrategy;
    keyManagerStrategyConstructor?: any;
}

export interface StorelyStoreKeyManagerConfig {
    storely: StorelyStore;
    key: string;
}

export interface StorelyStoreGetConfig {
    defaultValue?: any;
}

export interface StorelyStoreSetConfig {
    shouldEmit?: boolean;
}
