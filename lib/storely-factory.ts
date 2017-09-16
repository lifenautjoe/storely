/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {IStorelyFactoryMakeConfig, IStorelyFactoryConfig, IStorely} from './storely-interfaces';
import {StorelyFactoryConfigurationError} from './storely-errors';
import {Storely} from './storely';
import {EventEmitterDispatchStrategy} from './storely-event-dispatch-strategies';
import {EqualityValueChangeDetection} from './storely-value-change-detection-strategies';
import {ObjectStoreStrategy} from './storely-store-strategies';
import {WrapperKeyManager} from './storely-key-managers';

export class StorelyFactory {
    private static storelyFactorySingleton: StorelyFactory;
    private storelyDefaultConfig: IStorelyFactoryConfig;

    private constructor(config: IStorelyFactoryConfig) {
        if (!config) throw new StorelyFactoryConfigurationError('config is required. Are you sure you should be using new on this?');
        this.storelyDefaultConfig = config;
    }

    private static getSingleton() {
        if (this.storelyFactorySingleton) return this.storelyFactorySingleton;
        return (this.storelyFactorySingleton = StorelyFactory.makeSingleton());
    }

    private static makeSingleton() {
        return new StorelyFactory({
            eventDispatchStrategyConstructor: EventEmitterDispatchStrategy,
            valueChangeDetectionStrategyConstructor: EqualityValueChangeDetection,
            storeStrategyConstructor: ObjectStoreStrategy,
            keyManagerStrategyConstructor: WrapperKeyManager
        });
    }

    static make(configOverride?: IStorelyFactoryMakeConfig): IStorely {
        const storelyFactorySingleton = this.getSingleton();
        return storelyFactorySingleton.make(configOverride);
    }

    private make(configOverride?: IStorelyFactoryMakeConfig): IStorely {
        const config: IStorelyFactoryMakeConfig = configOverride || {};

        if (!config.valueChangeDetectionStrategy) {
            config.valueChangeDetectionStrategy = new this.storelyDefaultConfig.valueChangeDetectionStrategyConstructor();
        }

        if (!config.storeStrategy) {
            config.storeStrategy = new this.storelyDefaultConfig.storeStrategyConstructor();
        }

        if (!config.eventDispatchStrategy) {
            config.eventDispatchStrategy = new this.storelyDefaultConfig.eventDispatchStrategyConstructor();
        }

        if (!config.keyManagerStrategyConstructor) {
            config.keyManagerStrategyConstructor = this.storelyDefaultConfig.keyManagerStrategyConstructor;
        }

        if (!config.namespace) {
            config.namespace = this.storelyDefaultConfig.namespace;
        }

        return new Storely({
            eventDispatchStrategy: config.eventDispatchStrategy,
            storeStrategy: config.storeStrategy,
            valueChangeDetectionStrategy: config.valueChangeDetectionStrategy,
            keyManagerStrategyConstructor: config.keyManagerStrategyConstructor,
            namespace: config.namespace
        });
    }
}
