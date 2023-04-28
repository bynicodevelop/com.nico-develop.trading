import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	AlpacaCryptoClient,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import { AccountException } from '@packages/account';
import {
	Account,
	IConnectorService,
	Order,
	OrderSide,
	OrderStatus,
	OrderType,
	Position,
	subtractTimeFromDate,
	Symbol,
} from '@packages/common';

import { OrderException } from '../../../orders/src/exception';
import { Database } from '../database';
import { ConnectorOption } from '../options';

export class AlpacaService implements IConnectorService {
	private _option: ConnectorOption;

	private client: Alpaca;
	private stream: AlpacaCryptoClient;
	private database?: Database;

	constructor(option: ConnectorOption) {
		this._option = option;

		this.client = new Alpaca({
			keyId: option.KEY,
			secretKey: option.SECRET,
			paper: true,
			baseUrl: 'https://paper-api.alpaca.markets',
		});

		this.stream = this.client.crypto_stream_v2;
	}

	async onConnect(callback: () => void): Promise<void> {
		if (this._option.DATABASE_PATH) {
			this.database = new Database(this._option.DATABASE_PATH);

			await this.database.init();
		}

		this.stream.onConnect(callback);
	}

	connect(): void {
		this.stream.connect();
	}

	onError(callback: (error: Error) => void): void {
		this.stream.onError(callback);
	}

	onCryptoQuote(callback: (quote: any) => void): void {
		this.stream.onCryptoQuote(callback);
	}

	onCryptoBar(callback: (bar: any) => void): void {
		this.stream.onCryptoBar(callback);
	}

	subscribeForQuotes(symbols: string[]): void {
		this.stream.subscribeForQuotes(symbols);
	}

	subscribeForBars(symbols: string[]): void {
		this.stream.subscribeForBars(symbols);
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

	async createOrder(order: Position): Promise<Position | never> {
		try {
			const orderResult = await this.client.createOrder({
				symbol: order.symbol.name,
				qty: order.quantity,
				side: order.side,
				type: OrderType.Market,
				time_in_force: 'gtc',
			});

			order.id = orderResult.id;
			order.status = OrderStatus.Open;
			order.openDate = new Date();

			if (this.database) {
				return await this.database.createPosition(order);
			}
		} catch (error: any) {
			console.log(error);

			throw new OrderException(
				error.message,
				OrderException.ORDER_REJECTED_CODE
			);
		}

		return order;
	}

	async getPositions(): Promise<Position[]> {
		let positions: any[] = [];

		try {
			positions = await this.client.getPositions();

			if (this.database) {
				const databasePositions = await this.database.getPositions();

				positions = positions.map((position: any) => {
					const databasePosition = databasePositions.find(
						(databasePosition: any): boolean =>
							databasePosition.id === position.asset_id
					);

					return { ...position, ...databasePosition };
				});
			}
		} catch (error: any) {
			console.log(error);
		}

		return positions.map(
			(position: any): Position =>
				({
					id: position.asset_id,
					symbol: {
						name: position.symbol,
						exchangeName: position.exchange,
					},
					quantity: position.qty,
					side: position.side,
					pl: position.unrealized_pl,
					status: OrderStatus.Open,
					openDate: position.openDate,
					openPrice: position.openPrice,
				} as Position)
		);
	}

	async closePosition(symbol: Symbol): Promise<Position> {
		const order: Position = {} as Position;

		try {
			const position = await this.client.closePosition(symbol.name);

			console.log('Position closed', position);

			order.id = position.asset_id;
			order.symbol = {
				name: position.symbol,
				exchangeName: position.exchange,
			};
			order.quantity = position.qty;
			order.side = position.side === 'long' ? OrderSide.Buy : OrderSide.Sell;
			order.pl = position.unrealized_pl;

			order.closeDate = new Date();

			if (this.database) {
				const positionClosed = await this.database.closePosition(order);

				order.openDate = positionClosed.openDate;
				order.openPrice = positionClosed.openPrice;
				order.status = positionClosed.status;
			}
		} catch (error: any) {
			console.log(error);
		}

		return order;
	}

	async getAccount(): Promise<Account | never> {
		try {
			const result = await this.client.getAccount();

			return {
				id: result.id,
				currency: result.currency,
				balance: result.cash,
				equity: result.equity,
			} as Account;
		} catch (error: any) {
			console.log(error);

			throw new AccountException(
				error.message,
				AccountException.ACCOUNT_NOT_FOUND_CODE
			);
		}
	}

	async getClosedPositions(
		symbols: Symbol[],
		period: number,
		timeframe: 'day' | 'hour' | 'minute',
		limit: number
	): Promise<Order[]> {
		const date = new Date();
		let order: any[] = [];

		let dateAfter = subtractTimeFromDate(date, 0, 0, 0, period);

		if (timeframe === 'hour') {
			dateAfter = subtractTimeFromDate(date, 0, 0, period, 0);
		}

		if (timeframe === 'minute') {
			dateAfter = subtractTimeFromDate(date, 0, period, 0, 0);
		}

		try {
			order = await this.client.getOrders({
				status: 'closed',
				limit,
				after: dateAfter,
				until: date,
				direction: 'asc',
				symbols: symbols.map((symbol: Symbol): string => symbol.name),
				nested: true,
			});
		} catch (error: any) {
			console.log(error);
		}

		return order.map(
			(position: any): Order =>
				new Order(
					position.id,
					{
						name: position.symbol,
						exchangeName: position.exchange || 'alpaca',
					} as Symbol,
					position.qty,
					position.side === 'long' ? OrderSide.Buy : OrderSide.Sell,
					position.filled_avg_price
				)
		);
	}
}
