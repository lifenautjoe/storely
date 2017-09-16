/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */

/**
 * The function to call to remove the listener completely
 */
export type EventListenerRemover = () => void;

export type KeyValueChangedListener = (newValue: any, oldValue: any) => void;

export type KeyValueRemovedListener = (lastValue: any) => void;

export type ClearedListener = () => void;

export type ChangedListener = () => void;

export type EventDispatchStrategyListener = (...args: Array<any>) => void;
