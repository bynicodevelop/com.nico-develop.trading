import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	AlpacaCryptoClient,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import {
	IConnectorService,
	Order,
	OrderType,
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
}
