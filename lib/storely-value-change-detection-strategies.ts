/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {StorelyValueChangeDetectionStrategy} from './storely-interfaces';

/**
 * The default value change detector
 */
export class EqualityValueChangeDetection implements StorelyValueChangeDetectionStrategy {
    valueChanged(newValue: any, previousValue: any): boolean {
        return newValue !== previousValue;
    }
}

/*
export class StringifyValueChangeDetection implements StorelyValueChangeDetectionStrategy {
    valueChanged(newValue: any, previousValue: any) {

    }
}*/
