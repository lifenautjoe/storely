/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {StorelyMakeConfig, StorelyStoreFactoryConfig, StorelyStore} from './storely-interfaces';
import {StorelyConfigurationError} from './storely-errors';
import {StorelyStoreImp} from './storely-stores';
import {EventEmitterDispatchStrategy} from './storely-event-dispatch-strategies';
import {EqualityValueChangeDetection} from './storely-value-change-detection-strategies';
import {ObjectStorageStrategy} from './storely-storage-strategies';
import {StorelyManagerStrategyImp} from './storely-manager-strategies';

export class Storely {
    private static storelySingleton: Storely;
    private storelyStoreDefaultConfig: StorelyStoreFactoryConfig;

    protected constructor(config: StorelyStoreFactoryConfig) {
        if (!config) throw new StorelyConfigurationError('config is required. Are you sure you should be using new on this?');
        this.storelyStoreDefaultConfig = config;
    }

    private static getSingleton(): Storely {
        if (this.storelySingleton) return this.storelySingleton;
        return (this.storelySingleton = Storely.makeSingleton());
    }

    private static makeSingleton(): Storely {
        return new Storely({
            eventDispatchStrategyConstructor: EventEmitterDispatchStrategy,
            valueChangeDetectionStrategyConstructor: EqualityValueChangeDetection,
            storageStrategyConstructor: ObjectStorageStrategy,
            keyManagerStrategyConstructor: StorelyManagerStrategyImp
        });
    }

    static getStore(configOverride?: StorelyMakeConfig): StorelyStore {
        const storelySingleton = this.getSingleton();
        return storelySingleton.getStore(configOverride);
    }

    private getStore(configOverride?: StorelyMakeConfig): StorelyStore {
        const config: StorelyMakeConfig = configOverride || {};

        if (!config.valueChangeDetectionStrategy) {
            config.valueChangeDetectionStrategy = new this.storelyStoreDefaultConfig.valueChangeDetectionStrategyConstructor();
        }

        if (!config.storageStrategy) {
            config.storageStrategy = new this.storelyStoreDefaultConfig.storageStrategyConstructor();
        }
        if (!config.eventDispatchStrategy) {
            config.eventDispatchStrategy = new this.storelyStoreDefaultConfig.eventDispatchStrategyConstructor();
        }

        if (!config.keyManagerStrategyConstructor) {
            config.keyManagerStrategyConstructor = this.storelyStoreDefaultConfig.keyManagerStrategyConstructor;
        }

        if (!config.namespace) {
            config.namespace = this.storelyStoreDefaultConfig.namespace;
        }

        return new StorelyStoreImp({
            eventDispatchStrategy: config.eventDispatchStrategy,
            storageStrategy: config.storageStrategy,
            valueChangeDetectionStrategy: config.valueChangeDetectionStrategy,
            keyManagerStrategyConstructor: config.keyManagerStrategyConstructor,
            namespace: config.namespace
        });
    }
}

