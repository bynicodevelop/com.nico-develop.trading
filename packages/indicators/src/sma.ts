import { SMA } from 'technicalindicators';

import { OHLC } from '@packages/common';

import { IIndicator } from './iindicator';

export enum PriceType {
	Open = 'open',
	High = 'high',
	Low = 'low',
	Close = 'close',
}

export class Sma implements IIndicator {
	_name: string;

	private period: number;
	private values: number[];
	private price: PriceType;
	private sma: SMA;

	get name(): string {
		return this._name;
	}

	constructor(name: string, period: number, price: PriceType) {
		this.period = period;
		this.values = [];
		this.price = price;
		this._name = name;

		this.sma = new SMA({
			period: this.period,
			values: [],
		});
	}

	init(values: OHLC[]): void {
		for (const element of values) {
			const value = this.sma.nextValue(element[this.price]);

			if (value) {
				this.values.push(value);
			}
		}
	}

	nextValue(value: OHLC): void | never {
		const result = this.sma.nextValue(value[this.price]);

		if (result) {
			this.values.push(result);
		}
	}

	getValues(): number[] {
		return this.values;
	}

	getLastValue(): number | null {
		return this.values[this.values.length - 1] || null;
	}
	getValue(index: number): number | null {
		return this.values[index] || null;
	}
}
