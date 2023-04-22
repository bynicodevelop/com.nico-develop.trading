import { OHLC } from '@packages/common';

export interface IIndicator {
	_name: string;

	get name(): string;

	init(values: OHLC[]): void;

	nextValue(value: OHLC): void;

	getValues(): number[];

	getLastValue(): number | null;

	getValue(index: number): number | null;
}
