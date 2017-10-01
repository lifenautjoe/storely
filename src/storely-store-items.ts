/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {
    StorelyStore, StorelyStoreItemConfig, StorelyStoreGetConfig,
    StorelyStoreSetConfig, StorelyStoreItem
} from './storely-interfaces';
import {StorelyManagerConfigurationError} from './storely-errors';
import {KeyValueChangedListener, KeyValueRemovedListener} from './storely-types';


export class StorelyStoreItemImp implements StorelyStoreItem {
    private storely: StorelyStore;
    private key: string;

    constructor(config: StorelyStoreItemConfig) {
        if (!config.storely) throw new StorelyManagerConfigurationError('config.storely is required');
        this.storely = config.storely;
        if (!config.key) throw new StorelyManagerConfigurationError('config.key is required');
        this.key = config.key;
        if (typeof config.defaultValue !== 'undefined') this.setValue(config.defaultValue);
    }

    getValue(config?: StorelyStoreGetConfig): any {
        return this.storely.get(this.key, config);
    }

    setValue(value: any, config?: StorelyStoreSetConfig): any {
        this.storely.set(this.key, value, config);
    }

    remove(): any {
        this.storely.remove(this.key);
    }

    onValueChanged(listener: KeyValueChangedListener) {
        return this.storely.onItemValueChanged(this.key, listener);
    }

    onRemoved(listener: KeyValueRemovedListener) {
        return this.storely.onItemRemoved(this.key, listener);
    }
}

