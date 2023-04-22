import {
	IConnectorService,
	Order,
	OrderSide,
	Symbol,
} from '@packages/common';

import { OrderService } from './order';

const mockConnectorService = {
	createOrder: jest.fn(),
} as unknown as IConnectorService;

describe('OrderService', (): void => {
	let orderService: OrderService;

	beforeEach((): void => {
		orderService = new OrderService(mockConnectorService);
	});

	afterEach((): void => {
		jest.resetAllMocks();
	});

	describe('buy', (): void => {
		it('should call createOrder on the ConnectorService with a buy order', (): void => {
			orderService.buy({} as Symbol, 1);
			expect(mockConnectorService.createOrder).toHaveBeenCalledWith(
				new Order({} as Symbol, 1, OrderSide.Buy)
			);
		});
	});

	describe('sell', (): void => {
		it('should call createOrder on the ConnectorService with a sell order', (): void => {
			orderService.sell({} as Symbol, 1);
			expect(mockConnectorService.createOrder).toHaveBeenCalledWith(
				new Order({} as Symbol, 1, OrderSide.Sell)
			);
		});
	});
});
