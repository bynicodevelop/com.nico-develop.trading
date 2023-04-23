import { Account } from './models/account';
import { Position } from './models/position';
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

	createOrder(order: Position): Promise<Position | never>;

	getPositions(): Promise<Position[]>;

	closePosition(symbol: Symbol): Promise<Position | never>;

	getAccount(): Promise<Account>;
}
