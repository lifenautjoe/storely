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


export interface IStorely {
    set(key: string, value: any);

    remove(key: string): void;

    get(key: string): any;

    getOrSet(key: string, value: any): any;

    getAll(): Object;

    clear(): void;

    onKeyValueChanged(key: string, keyValueChangedListener: KeyValueChangedListener): EventListenerRemover;

    onKeyValueRemoved(key: string, keyValueRemovedListener: KeyValueRemovedListener): EventListenerRemover;

    onCleared(clearedListener: ClearedListener): EventListenerRemover;

    onChanged(clearedListener: ChangedListener): EventListenerRemover;

    getKeyManagerForKey(key: string): IStorelyKeyManagerStrategy;

    mergeEventRemovers(...eventRemovers: Array<EventListenerRemover>): EventListenerRemover;
}

/**
 * Manages an specific key within storely
 */
export interface IStorelyKeyManagerStrategy {
    set(value: any);

    getOrSet(value: any): any;

    get(): any;

    remove(): void;

    onValueChanged(keyValueChangedListener: KeyValueChangedListener);

    onValueRemoved(keyValueRemovedListener: KeyValueRemovedListener);
}

export interface IStorelyConfig {
    namespace?: string;
    eventDispatchStrategy: IStorelyEventDispatchStrategy;
    storeStrategy: IStorelyStoreStrategy;
    valueChangeDetectionStrategy: IStorelyValueChangeDetectionStrategy;
    keyManagerStrategyConstructor: any;
}

export interface IStorelyValueChangeDetectionStrategy {
    valueChanged(newValue: any, oldValue: any): boolean;
}

export interface IStorelyEventDispatchStrategy {
    emit(eventIdentifier: string, ...eventData): void;

    on(eventIdentifier: string, listener: EventDispatchStrategyListener): EventListenerRemover;
}

export interface IStorelyStoreStrategy {

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
export interface IStorelyFactoryConfig {
    namespace?: string;
    eventDispatchStrategyConstructor: any;
    storeStrategyConstructor: any;
    valueChangeDetectionStrategyConstructor: any;
    keyManagerStrategyConstructor: any;
}


export interface IStorelyFactoryMakeConfig {
    namespace?: string;
    eventDispatchStrategy?: IStorelyEventDispatchStrategy;
    storeStrategy?: IStorelyStoreStrategy;
    valueChangeDetectionStrategy?: IStorelyValueChangeDetectionStrategy;
    keyManagerStrategyConstructor?: any;
}

export interface IStorelyKeyManagerConfig {
    storely: IStorely;
    key: string;
}
