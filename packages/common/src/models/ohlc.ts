import { IModel } from './imodel';
import { Symbol } from './symbol';

interface IOHLC {
	symbol: Symbol;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	timestamp: Date;
}

export enum CandleType {
	Up = 'up',
	Down = 'down',
	Doji = 'doji',
}

export class OHLC implements IOHLC, IModel {
	symbol: Symbol;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	timestamp: Date;

	constructor(
		symbol: Symbol,
		open: number,
		high: number,
		low: number,
		close: number,
		volume: number,
		timestamp: Date
	) {
		this.symbol = symbol;
		this.open = open;
		this.high = high;
		this.low = low;
		this.close = close;
		this.volume = volume;
		this.timestamp = timestamp;
	}

	candleType(): string {
		if (this.open < this.close) {
			return CandleType.Up;
		} else if (this.open > this.close) {
			return CandleType.Down;
		} else {
			return CandleType.Doji;
		}
	}

	isCandleUp(): boolean {
		return this.candleType() === CandleType.Up;
	}

	isCandleDown(): boolean {
		return this.candleType() === CandleType.Down;
	}

	isCandleDoji(): boolean {
		return this.candleType() === CandleType.Doji;
	}

	toJson(): Record<string, any> {
		return {
			symbol: this.symbol,
			open: this.open,
			high: this.high,
			low: this.low,
			close: this.close,
			volume: this.volume,
			timestamp: this.timestamp,
		};
	}
}
