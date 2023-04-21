import { Symbol } from './symbol';

interface ITick {
	symbol: Symbol;
	askPrice: number;
	askSize: number;
	bidPrice: number;
	bidSize: number;
	spread: number;
	timestamp: Date;
}

export class Tick implements ITick {
	symbol: Symbol;
	askPrice: number;
	askSize: number;
	bidPrice: number;
	bidSize: number;
	spread: number;
	timestamp: Date;

	constructor(
		symbol: Symbol,
		askPrice: number,
		askSize: number,
		bidPrice: number,
		bidSize: number,
		timestamp: Date
	) {
		this.symbol = symbol;
		this.askPrice = askPrice;
		this.askSize = askSize;
		this.bidPrice = bidPrice;
		this.bidSize = bidSize;
		this.spread = askPrice - bidPrice;
		this.timestamp = timestamp;
	}

	toJson(): Record<string, any> {
		return {
			symbol: this.symbol,
			askPrice: this.askPrice,
			askSize: this.askSize,
			bidPrice: this.bidPrice,
			bidSize: this.bidSize,
			timestamp: this.timestamp,
		};
	}
}
