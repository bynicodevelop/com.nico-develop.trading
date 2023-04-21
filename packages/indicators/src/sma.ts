import { SMA } from 'technicalindicators';

import { IIndicator } from './iindicator';

export class Sma implements IIndicator {
    name = 'sma';

    period: number;
    values: number[];

    sma: SMA;

    constructor(period: number) {
        this.period = period;
        this.values = [];

        this.sma = new SMA({ period: this.period, values: this.values });
    }

    nextValue(value: number): void {
        this.values.push(value);
        
        this.sma.nextValue(value);
    }

    getValues(): number[] {
        return this.sma.getResult();
    }
}