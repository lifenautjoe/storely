/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */

import {StorelyEventDispatchStrategy} from './storely-interfaces';
import {EventDispatchStrategyListener, EventListenerRemover} from './storely-types';

import {EventEmitter} from 'eventemitter3';

export class EventEmitterDispatchStrategy implements StorelyEventDispatchStrategy {
    private eventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    emit(eventName: string, ...eventData) {
        this.eventEmitter.emit(eventName, ...eventData);
    }

    on(eventName: string, listener: EventDispatchStrategyListener): EventListenerRemover {
        this.eventEmitter.addListener(eventName, listener);
        return this.makeEventListenerRemover(eventName, listener);
    }

    private makeEventListenerRemover(eventName: string, listener: EventDispatchStrategyListener): EventListenerRemover {
        return () => {
            this.removeEventListener(eventName, listener);
        };
    }

    private removeEventListener(eventName: string, listener: EventDispatchStrategyListener): void {
        this.eventEmitter.removeListener(eventName, listener);
    }
}
