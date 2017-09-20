/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {StorelyStore, StorelyKeyManagerStrategy, StorelyStoreKeyManagerConfig, StorelyStoreGetConfig} from './storely-interfaces';
import {StorelyKeyManagerConfigurationError} from './storely-errors';
import {KeyValueChangedListener, KeyValueRemovedListener} from './storely-types';


/**
 * Manages a key by wrapping the calls to the storely store
 */
export class StorelyKeyManagerImp implements StorelyKeyManagerStrategy {
    private storely: StorelyStore;
    private key: string;

    constructor(config: StorelyStoreKeyManagerConfig) {
        if (!config.storely) throw new StorelyKeyManagerConfigurationError('config.storely is required');
        this.storely = config.storely;
        if (!config.key) throw new StorelyKeyManagerConfigurationError('config.key is required');
        this.key = config.key;
    }

    get(config?: StorelyStoreGetConfig): any {
        return this.storely.get(this.key, config);
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

