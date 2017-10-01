/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {
    StorelyStore, StorelyManagerStrategy, StorelyStoreKeyManagerConfig, StorelyStoreGetConfig,
    StorelyStoreSetConfig
} from './storely-interfaces';
import {StorelyManagerConfigurationError} from './storely-errors';
import {KeyValueChangedListener, KeyValueRemovedListener} from './storely-types';


/**
 * Manages a key by wrapping the calls to the storely store
 */
export class StorelyManagerStrategyImp implements StorelyManagerStrategy {
    private storely: StorelyStore;
    private key: string;

    constructor(config: StorelyStoreKeyManagerConfig) {
        if (!config.storely) throw new StorelyManagerConfigurationError('config.storely is required');
        this.storely = config.storely;
        if (!config.key) throw new StorelyManagerConfigurationError('config.key is required');
        this.key = config.key;
    }

    get(config?: StorelyStoreGetConfig): any {
        return this.storely.get(this.key, config);
    }

    set(value: any, config: StorelyStoreSetConfig): any {
        this.storely.set(this.key, value, config);
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

