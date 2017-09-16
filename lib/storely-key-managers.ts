/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {IStorely, IStorelyKeyManagerStrategy, IStorelyKeyManagerConfig} from './storely-interfaces';
import {StorelyKeyManagerConfigurationError} from './storely-errors';
import {KeyValueChangedListener, KeyValueRemovedListener} from './storely-types';


/**
 * Manages a key by wrapping the calls to storely
 */
export class WrapperKeyManager implements IStorelyKeyManagerStrategy {
    private storely: IStorely;
    private key: string;

    constructor(config: IStorelyKeyManagerConfig) {
        if (!config.storely) throw new StorelyKeyManagerConfigurationError('config.storely is required');
        this.storely = config.storely;
        if (!config.key) throw new StorelyKeyManagerConfigurationError('config.key is required');
        this.key = config.key;
    }

    getOrSet(value: any): any {
        return this.storely.getOrSet(this.key, value);
    }

    get(): any {
        return this.storely.get(this.key);
    }

    set(value: any): any {
        this.storely.set(this.key, value);
    }

    remove(): any {
        this.storely.remove(this.key);
    }

    onValueChanged(listener: KeyValueChangedListener) {
        return this.storely.onKeyValueChanged(this.key, listener);
    }

    onValueRemoved(listener: KeyValueRemovedListener) {
        return this.storely.onKeyValueRemoved(this.key, listener);
    }
}

