/**
 * @author Joel Hernandez <lifenautjoe@gmail.com>
 */
import {IStorelyValueChangeDetectionStrategy} from './storely-interfaces';

/**
 * The default value change detector
 */
export class EqualityValueChangeDetection implements IStorelyValueChangeDetectionStrategy {
    valueChanged(newValue: any, previousValue: any): boolean {
        return newValue !== previousValue;
    }
}
