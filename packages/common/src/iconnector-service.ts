import { Order } from './models/order';

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
}
