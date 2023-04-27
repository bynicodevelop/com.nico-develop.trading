import {
	IConnectorService,
	Order,
	OrderSide,
	Position,
	Symbol,
} from '@packages/common';

export class OrderService {
	/**
	 * Create a new order service instance.
	 *
	 * @see {@link AlpacaBacktestService} for class definition in backtest mode
	 * @see {@link AccountService} for class definition
	 *
	 * @param connectorService
	 */
	constructor(private connectorService: IConnectorService) {}

	/**
	 * Create a new buy order
	 *
	 * @param symbol
	 * @param quantity
	 * @returns {Position} | never
	 * @see {@link Position} for class definition
	 * @see {@link AlpacaBacktestService} for class definition in backtest mode
	 * @see {@link AlpacaConnector} for class definition in live mode
	 */
	async buy(symbol: Symbol, quantity: number): Promise<Position | never> {
		return this.connectorService.createOrder(
			new Position(symbol, quantity, OrderSide.Buy)
		);
	}

	/**
	 * Create a new sell order
	 *
	 * @param symbol
	 * @param quantity
	 * @returns {Position} | never
	 * @see {@link Position} for class definition
	 * @see {@link AlpacaBacktestService} for class definition in backtest mode
	 * @see {@link AlpacaConnector} for class definition in live mode
	 */
	async sell(symbol: Symbol, quantity: number): Promise<Position | never> {
		return this.connectorService.createOrder(
			new Position(symbol, quantity, OrderSide.Sell)
		);
	}

	/**
	 * Get all open positions
	 *
	 * @returns {Position[]} | never
	 * @see {@link Position} for class definition
	 * @see {@link AlpacaBacktestService} for class definition in backtest mode
	 * @see {@link AlpacaConnector} for class definition in live mode
	 */
	async getPositions(): Promise<Position[]> {
		return this.connectorService.getPositions();
	}

	/**
	 * Close a position
	 * Ferme une position
	 *
	 * @param symbol
	 * @returns {Position} | never
	 * @see {@link Position} for class definition
	 * @see {@link AlpacaBacktestService} for class definition in backtest mode
	 * @see {@link AlpacaConnector} for class definition in live mode
	 */
	async closePosition(symbol: Symbol): Promise<Position | never> {
		return this.connectorService.closePosition(symbol);
	}

	async getClosedPositions(
		symbols: Symbol[],
		period = 10,
		timeframe: 'day' | 'hour' | 'minute' = 'day',
		limit = 100
	): Promise<Order[]> {
		return this.connectorService.getClosedPositions(
			symbols,
			period,
			timeframe,
			limit
		);
	}
}
