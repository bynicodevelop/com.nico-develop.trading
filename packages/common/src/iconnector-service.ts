import { Account } from './models/account';
import { Order } from './models/order';
import { Position } from './models/position';
import { Symbol } from './models/symbol';

export interface IConnectorService {
	addObserver(observer: (event: any, data?: any) => void): void;

	getCryptoQuotes(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown>;

	getCryptoBars(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown>;

	onConnect(callback: () => void): void;

	connect(): void;

	onError(callback: (error: Error) => void): void;

	onCryptoQuote(callback: (quote: any) => void): void;

	onCryptoBar(callback: (bar: any) => void): void;

	subscribeForQuotes(symbols: string[]): void;

	subscribeForBars(symbols: string[]): void;

	createOrder(order: Position): Promise<Position | never>;

	getPositions(): Promise<Position[]>;

	closePosition(id: string): Promise<Position | never>;

	getAccount(): Promise<Account>;

	getClosedPositions(
		symbols: Symbol[],
		period: number,
		timeframe: 'day' | 'hour' | 'minute',
		limit: number
	): Promise<Order[]>;
}
