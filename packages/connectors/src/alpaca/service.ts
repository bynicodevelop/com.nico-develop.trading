import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	AlpacaCryptoClient,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import {
	IConnectorService,
	Order,
	OrderSide,
	OrderType,
	Symbol,
} from '@packages/common';

import { OrderException } from '../../../orders/src/exception';
import { ConnectorOption } from '../options';

export class AlpacaService implements IConnectorService {
	private client: Alpaca;
	private stream: AlpacaCryptoClient;

	constructor(option: ConnectorOption) {
		this.client = new Alpaca({
			keyId: option.KEY,
			secretKey: option.SECRET,
			paper: true,
			baseUrl: 'https://paper-api.alpaca.markets',
		});

		this.stream = this.client.crypto_stream_v2;
	}

	onConnect(callback: () => void): void {
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

	getCryptoBars(
		symbols: string[],
		options: any
	): AsyncGenerator<any, void, unknown> {
		return this.client.getCryptoBars(symbols, options);
	}

	async createOrder(order: Order): Promise<Order | never> {
		try {
			const orderResult = await this.client.createOrder({
				symbol: order.symbol.name,
				qty: order.quantity,
				side: order.side,
				type: OrderType.Market,
				time_in_force: 'gtc',
			});

			order.id = orderResult.id;
		} catch (error: any) {
			console.log(error);

			throw new OrderException(
				error.message,
				OrderException.ORDER_REJECTED_CODE
			);
		}

		return order;
	}

	async getPositions(): Promise<Order[]> {
		let positions: any[] = [];

		try {
			positions = await this.client.getPositions();
		} catch (error: any) {
			console.log(error);
		}

		return positions.map(
			(position: any): Order =>
				({
					id: position.asset_id,
					symbol: {
						name: position.symbol,
						exchangeName: position.exchange,
					},
					quantity: position.qty,
					side: position.side === 'long' ? OrderSide.Buy : OrderSide.Sell,
					pl: position.unrealized_pl,
				} as Order)
		);
	}

	async closePosition(symbol: Symbol): Promise<Order> {
		const order: Order = {} as Order;

		try {
			const position = await this.client.closePosition(symbol.name);

			order.id = position.asset_id;
			order.symbol = {
				name: position.symbol,
				exchangeName: position.exchange,
			};
			order.quantity = position.qty;
			order.side = position.side === 'long' ? OrderSide.Buy : OrderSide.Sell;
			order.pl = position.unrealized_pl;
		} catch (error: any) {
			console.log(error);
		}

		return order;
	}
}
