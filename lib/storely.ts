/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {StorelyStoreFactoryMakeConfig, StorelyStoreFactoryConfig, StorelyStore} from './storely-interfaces';
import {StorelyFactoryConfigurationError} from './storely-errors';
import {StorelyStoreImp} from './storely-stores';
import {EventEmitterDispatchStrategy} from './storely-event-dispatch-strategies';
import {EqualityValueChangeDetection} from './storely-value-change-detection-strategies';
import {ObjectStorageStrategy} from './storely-storage-strategies';
import {StorelyKeyManagerImp} from './storely-key-manager-strategies';

export class Storely {
    private static storelySingleton: Storely;
    private storelyStoreDefaultConfig: StorelyStoreFactoryConfig;

    private constructor(config: StorelyStoreFactoryConfig) {
        if (!config) throw new StorelyFactoryConfigurationError('config is required. Are you sure you should be using new on this?');
        this.storelyStoreDefaultConfig = config;
    }

    private static getSingleton() {
        if (this.storelySingleton) return this.storelySingleton;
        return (this.storelySingleton = Storely.makeSingleton());
    }

    private static makeSingleton() {
        return new Storely({
            eventDispatchStrategyConstructor: EventEmitterDispatchStrategy,
            valueChangeDetectionStrategyConstructor: EqualityValueChangeDetection,
            storageStrategyConstructor: ObjectStorageStrategy,
            keyManagerStrategyConstructor: StorelyKeyManagerImp
        });
    }

    static getStore(configOverride?: StorelyStoreFactoryMakeConfig): StorelyStore {
        const storelySingleton = this.getSingleton();
        return storelySingleton.getStore(configOverride);
    }

    private getStore(configOverride?: StorelyStoreFactoryMakeConfig): StorelyStore {
        const config: StorelyStoreFactoryMakeConfig = configOverride || {};

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
