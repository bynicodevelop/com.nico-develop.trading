import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	IAccount,
	Order,
	OrderSide,
	OrderStatus,
	Position,
	Symbol,
} from '@packages/common';
import {
	IConnectorBacktestService,
} from '@packages/common/src/iconnector-backtest-service';

import { Database } from '../database';
import { ConnectorOption } from '../options';

export class AlpacaBacktestService implements IConnectorBacktestService {
	private _options: ConnectorOption;
	private _orders: Position[] = [];

	private price = 0;
	private date: Date | null = null;

	private database?: Database;

	private client: Alpaca;

	/**
	 * Return P&L of Position
	 * Retourne le P&L de la position
	 *
	 * @param order {@link Position}
	 * @returns number
	 */
	private calculatePL(order: Position): number {
		if (order.side === OrderSide.Buy) {
			return order.quantity * (order.closePrice - order.openPrice);
		}

		return order.quantity * (order.openPrice - order.closePrice);
	}

	/**
	 * Calculate the profit and loss of the open positions
	 * Calcule le profit et la perte des positions ouvertes
	 *
	 * @param orders {@link Position}
	 * @returns
	 */
	private calculatePlOnOpenPositions(orders: Position[]): number {
		return orders
			.filter((order): boolean => order.status === OrderStatus.Open)
			.reduce((acc, order): number => acc + this.calculatePL(order), 0);
	}

	/**
	 * Calculate the profit and loss of the closed positions
	 * Calcule le profit et la perte des positions fermées
	 *
	 * @param orders {@link Position}
	 * @returns
	 */
	private calculatePlOnClosedPositions(orders: Position[]): number {
		return orders
			.filter((order): boolean => order.status === OrderStatus.Closed)
			.reduce((acc, order): number => acc + this.calculatePL(order), 0);
	}

	/**
	 * Calculate the balance of the account
	 * Calcule le solde du compte
	 *
	 * @param orders {@link Position}
	 * @returns
	 */
	private calculateBalance(orders: Position[]): number {
		return this.balance + this.calculatePlOnClosedPositions(orders);
	}

	constructor(option: ConnectorOption, private balance: number) {
		this.client = new Alpaca({
			keyId: option.KEY,
			secretKey: option.SECRET,
			paper: true,
			baseUrl: 'https://paper-api.alpaca.markets',
		});

		this._options = option;
	}

	addObserver(observer: (event: any, data?: any) => void): void {
		throw new Error('Method not implemented.');
	}

	updatePrice(price: number): void {
		this.price = price;

		this._orders
			.filter((order): boolean => order.status === OrderStatus.Open)
			.forEach((order): void => {
				order.closePrice = price;
			});
	}

	updateDate(date: Date): void {
		this.date = date;
	}

	getCryptoQuotes(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown> {
		return this.client.getCryptoQuotes(symbols, options);
	}

	getCryptoBars(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown> {
		return this.client.getCryptoBars(symbols, options);
	}

	onConnect(callback: () => void): void {
		if (this._options.DATABASE_PATH) {
			this.database = new Database(this._options.DATABASE_PATH);

			this.database.init().then((): void => {
				console.log('Database initialized');

				callback();
			});
		}
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

	async createOrder(order: Position): Promise<Position> {
		order.id = Math.random().toString(36).substring(7);

		order.openPrice = this.price;
		order.closePrice = this.price;
		order.openDate = this.date!;
		order.closeDate = this.date!;

		if (this.database) {
			await this.database.createPosition(order);
		}

		return Promise.resolve(order);
	}

	getPositions(): Promise<Position[]> {
		if (this.database) {
			return this.database.getPositions();
		}

		return Promise.resolve([]);
	}

	async closePosition(symbol: Symbol): Promise<Position> {
		const order = this._orders.find(
			(order): boolean =>
				order.symbol.name === symbol.name && order.status === OrderStatus.Open
		);

		if (!order) {
			throw new Error(`Position ${symbol} not found`);
		}

		order.status = OrderStatus.Closed;
		order.closePrice = this.price;
		order.closeDate = this.date!;

		if (this.database) {
			await this.database.closePosition(order);
		}

		return Promise.resolve(order);
	}

	getAccount(): Promise<IAccount> {
		const balance = this.calculateBalance(this._orders);
		const pl = this.calculatePlOnOpenPositions(this._orders);

		return Promise.resolve({
			id: 'backtest',
			currency: 'USD',
			balance,
			pl,
			equity: balance + pl,
		});
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
