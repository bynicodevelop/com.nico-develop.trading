import { OHLC } from '@packages/common';

export interface IIndicator {
	_name: string;

	/** @todo Déplacer dans une interface uniquement utilisable par le connecteur */
	get name(): string;

	/** @todo Déplacer dans une interface uniquement utilisable par le connecteur */
	init(values: OHLC[]): void;

	/** @todo Déplacer dans une interface uniquement utilisable par le connecteur */
	nextValue(value: OHLC): void;

	getValues(): number[];

	getLastValue(): number | null;

	getValue(index: number): number | null;
}
