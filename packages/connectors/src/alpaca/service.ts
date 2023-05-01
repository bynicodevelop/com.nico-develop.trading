import Alpaca from '@alpacahq/alpaca-trade-api';
import { AlpacaCryptoClient } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import { AccountException } from '@packages/account';
import {
	Account,
	ConnectorEvent,
	Exception,
	ExchangeCrypto,
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

	private observable?: (event: ConnectorEvent, data?: any) => void;

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

	private createPositionModel(data: any): Position | never {
		if (!data['id']) {
			throw new Exception('Position id is required', 'POSITION_ID_REQUIRED');
		}

		if (!data['symbol']) {
			throw new Exception(
				'Position symbol is required',
				'POSITION_SYMBOL_REQUIRED'
			);
		}

		if (!data['symbol']['name'] || !data['symbol']['exchangeName']) {
			throw new Exception(
				'Position symbol must be of type Symbol',
				'POSITION_SYMBOL_INVALID'
			);
		}

		if (!data['quantity']) {
			throw new Exception(
				'Position quantity is required',
				'POSITION_QUANTITY_REQUIRED'
			);
		}

		if (!data['side']) {
			throw new Exception(
				'Position side is required',
				'POSITION_SIDE_REQUIRED'
			);
		}

		const position = new Position(
			data['id'],
			{
				name: data['symbol']['name'],
				exchangeName: data['symbol']['exchangeName'] as ExchangeCrypto,
			} as Symbol,
			data['quantity'],
			data['side'] as OrderSide
		);

		if (data['status']) {
			position.status = data['status'] as OrderStatus;
		}

		if (data['openPrice']) {
			position.openPrice = parseFloat(data['openPrice']);
		}

		if (data['closePrice']) {
			position.closePrice = parseFloat(data['closePrice']);
		}

		if (data['pl']) {
			position.pl = parseFloat(data['pl']);
		}

		if (data['openDate']) {
			position.openDate = new Date(data['openDate']);
		}

		if (data['closeDate']) {
			position.closeDate = new Date(data['closeDate']);
		}

		return position;
	}

	private async savePosition(position: Position): Promise<void> {
		if (!position.id) return;

		if (this.database) {
			if (position.status === OrderStatus.Open) {
				if (!position.closePrice) {
					await this.database.createPosition(position);
				} else {
					await this.database.updatePosition(position);
				}
			} else {
				await this.database.closePosition(position);
			}
		}
	}

	private findPositionBySymbolName(
		positions: any[],
		symbolName: string
	):
		| {
				current_price: string;
				avg_entry_price: string;
				unrealized_pl: string;
		  }
		| undefined {
		return positions.find((position: any): boolean => {
			return position.symbol === symbolName;
		}) as
			| {
					current_price: string;
					avg_entry_price: string;
					unrealized_pl: string;
			  }
			| undefined;
	}

	private filterOpenPositions(positions: Position[]): Position[] {
		return positions.filter(
			(position: Position): boolean => position.status === OrderStatus.Open
		);
	}

	private async syncPositions(clientPositions: any): Promise<Position[]> {
		let positions: Position[] = [];

		try {
			if (this.database) {
				positions = await this.database.getPositions();

				const openedPositions = this.filterOpenPositions(positions);

				positions = await Promise.all(
					openedPositions
						.filter((position: Position): boolean => {
							return !!this.findPositionBySymbolName(
								clientPositions,
								position.symbol.name
							);
						})
						.map(async (position: Position): Promise<Position | never> => {
							const onlinePosition = this.findPositionBySymbolName(
								clientPositions,
								position.symbol.name
							);

							if (!onlinePosition) {
								throw new OrderException(
									'Position not found',
									OrderException.POSITION_NOT_FOUND_CODE
								);
							}

							return this.createPositionModel({
								...position,
								closeDate: new Date(),
								closePrice:
									onlinePosition.current_price ||
									onlinePosition.avg_entry_price,
								pl: onlinePosition.unrealized_pl,
							});
						})
				);
			}
		} catch (error: any) {
			console.log(error);
		}

		return positions;
	}

	addObserver(observer: (event: any, data?: any) => void): void {
		this.observable = observer;
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
		let result: Position = order;

		try {
			const orderResult = await this.client.createOrder({
				symbol: result.symbol.name,
				qty: result.quantity,
				side: result.side,
				type: OrderType.Market,
				time_in_force: 'gtc',
				client_order_id: result.id,
			});

			console.log('Order created', orderResult);

			if (!orderResult) {
				throw new OrderException(
					'Order not found',
					OrderException.ORDER_REJECTED_CODE
				);
			}

			const resultOrder = await this.client.getPosition(result.symbol.name);

			console.log('Result order', resultOrder);

			result.status = OrderStatus.Open;

			result.openDate = new Date();
			result.openPrice = parseFloat(`${resultOrder.avg_entry_price}`);
			result.quantity = parseFloat(`${resultOrder.qty_available}`);
			result.pl = parseFloat(`${resultOrder.unrealized_pl}`);

			await this.savePosition(result);

			this.observable?.(ConnectorEvent.OrderCreated, result);
		} catch (error: any) {
			console.log(error);
		}

		return order;
	}

	async getPositions(): Promise<Position[]> {
		let positions: Position[] = [];

		try {
			if (this.database) {
				const clientPositions = await this.client.getPositions();

				positions = await this.syncPositions(clientPositions);

				for (const position of positions) {
					await this.savePosition(position);
				}
			}
		} catch (error: any) {
			console.log(error.message);
		}

		return positions;
	}

	async closePosition(id: string): Promise<Position> {
		let order = (await this.database?.getPosition(id)) as Position;

		try {
			const clientPositions = await this.client.getPositions();

			const positions = await this.syncPositions(clientPositions);

			const onlineOrder = this.findPositionBySymbolName(
				positions,
				order.symbol.name
			);

			console.log('Online order', onlineOrder);

			const position = await this.client.closePosition(order.symbol.name);

			console.log('Position closed', position);

			order = this.createPositionModel({
				...order,
				side: position.side === 'long' ? OrderSide.Buy : OrderSide.Sell,
				status: OrderStatus.Closed,
				closePrice: onlineOrder?.current_price || order.closePrice,
				pl: onlineOrder?.unrealized_pl || order.pl || 0,
				closeDate: new Date(),
			});

			await this.savePosition(order);
		} catch (error: any) {
			console.log(error);
		}

		this.observable?.(ConnectorEvent.OrderClosed, order);

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
