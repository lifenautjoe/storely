/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {StorelyStorageStrategy} from './storely-interfaces';

export class ObjectStorageStrategy implements StorelyStorageStrategy {
    private store: Object;

    constructor(store: Object) {
        this.store = store || {};
    }

    get(key: string): any {
        return this.store[key];
    }

    getAll(): Object {
        return Object.assign({}, this.store);
    }

    set(key: string, value: Object): void {
        this.store[key] = value;
    }

    remove(key: string): void {
        delete this.store[key];
    }

    clear(): void {
        this.store = {};
    }

    getKeys() {
        return Object.keys(this.store);
    }
}
