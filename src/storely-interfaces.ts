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


export interface StorelyStore extends StorelyEventDispatchStrategy {
    set(key: string, value: any, config?: StorelyStoreSetConfig);

    remove(key: string): void;

    get(key: string, config?: StorelyStoreGetConfig): any;

    clear(): void;

    onItemValueChanged(key: string, keyValueChangedListener: KeyValueChangedListener): EventListenerRemover;

    onItemRemoved(key: string, keyValueRemovedListener: KeyValueRemovedListener): EventListenerRemover;

    onCleared(clearedListener: ClearedListener): EventListenerRemover;

    onChanged(clearedListener: ChangedListener): EventListenerRemover;

    getItem(key: string, config?: StorelyStoreGetConfig): StorelyStoreItem;

    mergeEventRemovers(...eventRemovers: Array<EventListenerRemover>): EventListenerRemover;
}

/**
 * Manages an specific key within storely
 */
export interface StorelyStoreItem {
    setValue(value: any, config?: StorelyStoreSetConfig);

    getValue(config?: StorelyStoreGetConfig): any;

    remove(): void;

    onValueChanged(keyValueChangedListener: KeyValueChangedListener);

    onRemoved(keyValueRemovedListener: KeyValueRemovedListener);
}


export interface StorelyStoreConfig {
    namespace?: string;
    eventDispatchStrategy: StorelyEventDispatchStrategy;
    storageStrategy: StorelyStorageStrategy;
    valueChangeDetectionStrategy: StorelyValueChangeDetectionStrategy;
    storeItemConstructor: any;
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
    storeItemConstructor: any;
}


export interface StorelyMakeConfig {
    namespace?: string;
    eventDispatchStrategy?: StorelyEventDispatchStrategy;
    storageStrategy?: StorelyStorageStrategy;
    valueChangeDetectionStrategy?: StorelyValueChangeDetectionStrategy;
    storeItemConstructor?: any;
}

export interface StorelyStoreItemConfig {
    storely: StorelyStore;
    key: string;
    defaultValue?: any;
}

export interface StorelyStoreGetConfig {
    defaultValue?: any;
}

export interface StorelyStoreGetItemConfig {
    defaultValue?: any;
}

export interface StorelyStoreSetConfig {
    shouldEmit?: boolean;
}
