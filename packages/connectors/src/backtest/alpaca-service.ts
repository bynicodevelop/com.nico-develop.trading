import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	IAccount,
	IConnectorService,
	Order,
	Position,
	Symbol,
} from '@packages/common';

import { ConnectorOption } from '../options';

export class AlpacaBacktestService implements IConnectorService {
	private client: Alpaca;

	constructor(option: ConnectorOption) {
		this.client = new Alpaca({
			keyId: option.KEY,
			secretKey: option.SECRET,
			paper: true,
			baseUrl: 'https://paper-api.alpaca.markets',
		});
	}

	getCryptoBars(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown> {
		return this.client.getCryptoBars(symbols, options);
	}
	onConnect(callback: () => void): void {
		throw new Error('Method not implemented.');
	}
	connect(): void {
		throw new Error('Method not implemented.');
	}
	onError(callback: (error: Error) => void): void {
		throw new Error('Method not implemented.');
	}
	onCryptoQuote(callback: (quote: any) => void): void {
		throw new Error('Method not implemented.');
	}
	onCryptoBar(callback: (bar: any) => void): void {
		throw new Error('Method not implemented.');
	}
	subscribeForQuotes(symbols: string[]): void {
		throw new Error('Method not implemented.');
	}
	subscribeForBars(symbols: string[]): void {
		throw new Error('Method not implemented.');
	}
	createOrder(order: Position): Promise<Position> {
		throw new Error('Method not implemented.');
	}
	getPositions(): Promise<Position[]> {
		throw new Error('Method not implemented.');
	}
	closePosition(symbol: Symbol): Promise<Position> {
		throw new Error('Method not implemented.');
	}
	getAccount(): Promise<IAccount> {
		throw new Error('Method not implemented.');
	}
	getClosedPositions(
		symbols: Symbol[],
		period: number,
		timeframe: 'day' | 'hour' | 'minute',
		limit: number
	): Promise<Order[]> {
		throw new Error('Method not implemented.');
	}
}
