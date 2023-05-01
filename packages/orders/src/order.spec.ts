import {
	IConnectorService,
	OrderSide,
	Position,
	Symbol,
} from '@packages/common';

import { OrderService } from './order';

jest.mock('uuid', (): object => ({
	v4: (): string => 'uuid',
}));

const mockConnectorService = {
	createOrder: jest.fn(),
	getPositions: jest.fn(),
	closePosition: jest.fn(),
	getClosedPositions: jest.fn(),
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
		it('should call createOrder on the ConnectorService with a buy order', async (): Promise<void> => {
			await orderService.buy({} as Symbol, 1);

			const order = new Position('uuid', {} as Symbol, 1, OrderSide.Buy);

			expect(mockConnectorService.createOrder).toHaveBeenCalledWith(order);
		});
	});

	describe('sell', (): void => {
		it('should call createOrder on the ConnectorService with a sell order', async (): Promise<void> => {
			await orderService.sell({} as Symbol, 1);

			const order = new Position('uuid', {} as Symbol, 1, OrderSide.Sell);

			expect(mockConnectorService.createOrder).toHaveBeenCalledWith(order);
		});
	});

	describe('getOpenOrder', (): void => {
		it('should call getPositions on the ConnectorService', async (): Promise<void> => {
			await orderService.getPositions();
			expect(mockConnectorService.getPositions).toHaveBeenCalled();
		});
	});

	describe('closePosition', (): void => {
		it('should call closePosition on the ConnectorService with the symbol', async (): Promise<void> => {
			await orderService.closePosition('uuid');

			expect(mockConnectorService.closePosition).toHaveBeenCalledWith('uuid');
		});
	});

	describe('getClosedPositions', (): void => {
		it('should call getClosedPositions on the ConnectorService with the symbol', async (): Promise<void> => {
			await orderService.getClosedPositions([{} as Symbol], 10, 'day', 100);
			expect(mockConnectorService.getClosedPositions).toHaveBeenCalledWith(
				[{} as Symbol],
				10,
				'day',
				100
			);
		});
	});
});
