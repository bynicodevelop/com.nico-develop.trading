import { Account } from './models/account';
import { Order } from './models/order';
import { Symbol } from './models/symbol';

export interface IConnectorService {
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

	createOrder(order: Order): Promise<Order | never>;

	getPositions(): Promise<Order[]>;

	closePosition(symbol: Symbol): Promise<Order | never>;

	getAccount(): Promise<Account>;
}
