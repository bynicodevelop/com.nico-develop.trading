import { OHLC } from '@packages/common';

import { IIndicator } from './iindicator';

export class Indicator implements Partial<IIndicator> {
	private indicators: Record<string, IIndicator> = {};

	get(name?: string): IIndicator | IIndicator[] {
		if (name) {
			return this.indicators[name];
		}

		return Object.values(this.indicators);
	}

	init(values: OHLC[]): void {
		Object.values(this.indicators).forEach((indicator): void =>
			indicator.init(values)
		);
	}

	addIndicator(indicator: IIndicator): void {
		this.indicators[indicator.name] = indicator;
	}

	nextValue(value: OHLC): void {
		Object.values(this.indicators).forEach((indicator): void =>
			indicator.nextValue(value)
		);
	}
}
