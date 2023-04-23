import {
	IConnectorService,
	OrderSide,
	Position,
	Symbol,
} from '@packages/common';

export class OrderService {
	constructor(private connectorService: IConnectorService) {}

	async buy(symbol: Symbol, quantity: number): Promise<Position | never> {
		return this.connectorService.createOrder(
			new Position(symbol, quantity, OrderSide.Buy)
		);
	}

	async sell(symbol: Symbol, quantity: number): Promise<Position | never> {
		return this.connectorService.createOrder(
			new Position(symbol, quantity, OrderSide.Sell)
		);
	}

	async getPositions(): Promise<Position[]> {
		return this.connectorService.getPositions();
	}

	async closePosition(symbol: Symbol): Promise<Position | never> {
		return this.connectorService.closePosition(symbol);
	}
}
