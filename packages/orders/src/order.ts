import {
	IConnectorService,
	Order,
	OrderSide,
	Symbol,
} from '@packages/common';

export class OrderService {
	constructor(private connectorService: IConnectorService) {}

	async buy(symbol: Symbol, quantity: number): Promise<Order | never> {
		return this.connectorService.createOrder(
			new Order(symbol, quantity, OrderSide.Buy)
		);
	}

	async sell(symbol: Symbol, quantity: number): Promise<Order | never> {
		return this.connectorService.createOrder(
			new Order(symbol, quantity, OrderSide.Sell)
		);
	}

	async getPositions(): Promise<Order[]> {
		return this.connectorService.getPositions();
	}

	async closePosition(symbol: Symbol): Promise<Order | never> {
		return this.connectorService.closePosition(symbol);
	}
}
