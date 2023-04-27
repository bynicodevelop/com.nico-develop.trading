import Alpaca from '@alpacahq/alpaca-trade-api';
import {
	AlpacaCryptoClient,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import {
	OrderSide,
	OrderStatus,
	OrderType,
	Position,
	Symbol,
} from '@packages/common';

import { OrderException } from '../../../orders/src/exception';
import { AlpacaService } from './service';

jest.mock('@alpacahq/alpaca-trade-api', () => ({
	__esModule: true,
	default: jest.fn().mockReturnValue({
		crypto_stream_v2: {
			onConnect: jest.fn(),
			connect: jest.fn(),
			onError: jest.fn(),
			onCryptoQuote: jest.fn(),
			onCryptoBar: jest.fn(),
			subscribeForQuotes: jest.fn(),
			subscribeForBars: jest.fn(),
		},
		getCryptoBars: jest.fn(),
		createOrder: jest.fn(),
		getPositions: jest.fn() as jest.MockedFunction<() => Promise<any[]>>,
	}),
}));

jest.mock(
	'@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2',
	() => ({
		__esModule: true,
		AlpacaCryptoClient: jest.fn().mockImplementation(() => ({
			onConnect: jest.fn(),
			connect: jest.fn(),
			onError: jest.fn(),
			onCryptoQuote: jest.fn(),
			onCryptoBar: jest.fn(),
			subscribeForQuotes: jest.fn(),
			subscribeForBars: jest.fn(),
		})),
	})
);

describe('AlpacaService', () => {
	let alpacaService: AlpacaService;
	let mockClient: Alpaca;
	let mockStream: AlpacaCryptoClient;

	beforeEach(() => {
		mockClient = new Alpaca({} as any) as jest.Mocked<Alpaca>;
		mockStream = new AlpacaCryptoClient(
			{} as any
		) as jest.Mocked<AlpacaCryptoClient>;

		alpacaService = new AlpacaService({ KEY: 'key', SECRET: 'secret' });
		alpacaService['client'] = mockClient;
		alpacaService['stream'] = mockStream;
	});

	describe('onConnect', () => {
		it('should call onConnect on the stream object', () => {
			const mockCallback = jest.fn();
			alpacaService.onConnect(mockCallback);
			expect(mockStream.onConnect).toHaveBeenCalledWith(mockCallback);
		});
	});

	describe('connect', () => {
		it('should call connect on the stream object', () => {
			alpacaService.connect();
			expect(mockStream.connect).toHaveBeenCalled();
		});
	});

	describe('onError', () => {
		it('should call onError on the stream object', () => {
			const mockCallback = jest.fn();
			alpacaService.onError(mockCallback);
			expect(mockStream.onError).toHaveBeenCalledWith(mockCallback);
		});
	});

	describe('onCryptoQuote', () => {
		it('should call onCryptoQuote on the stream object', () => {
			const mockCallback = jest.fn();
			alpacaService.onCryptoQuote(mockCallback);
			expect(mockStream.onCryptoQuote).toHaveBeenCalledWith(mockCallback);
		});
	});

	describe('onCryptoBar', () => {
		it('should call onCryptoBar on the stream object', () => {
			const mockCallback = jest.fn();
			alpacaService.onCryptoBar(mockCallback);
			expect(mockStream.onCryptoBar).toHaveBeenCalledWith(mockCallback);
		});
	});

	describe('subscribeForQuotes', () => {
		it('should call subscribeForQuotes on the stream object', () => {
			const mockSymbols = ['BTC', 'ETH'];
			alpacaService.subscribeForQuotes(mockSymbols);
			expect(mockStream.subscribeForQuotes).toHaveBeenCalledWith(mockSymbols);
		});
	});

	describe('subscribeForBars', () => {
		it('should call subscribeForBars on the stream object', () => {
			const mockSymbols = ['BTC', 'ETH'];
			alpacaService.subscribeForBars(mockSymbols);
			expect(mockStream.subscribeForBars).toHaveBeenCalledWith(mockSymbols);
		});
	});

	describe('getCryptoBars', () => {
		it('should call getCryptoBars on the client object', () => {
			const mockSymbols = ['BTC', 'ETH'];
			const mockOptions = { limit: 100 };
			alpacaService.getCryptoBars(mockSymbols, mockOptions);
			expect(alpacaService['client'].getCryptoBars).toHaveBeenCalledWith(
				mockSymbols,
				mockOptions
			);
		});
	});

	describe('createOrder', () => {
		const order = {
			id: '',
			symbol: { name: 'AAPL', exchangeName: 'NASDAQ' } as unknown as Symbol,
			quantity: 10,
			side: OrderSide.Buy,
			pl: 0,
		} as Position;
		const orderResult = { id: '123' };

		beforeEach(() => {
			jest.spyOn(mockClient, 'createOrder').mockResolvedValue(orderResult);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should call createOrder on the client object with the right arguments', async () => {
			await alpacaService.createOrder(order);
			expect(mockClient.createOrder).toHaveBeenCalledWith({
				symbol: order.symbol.name,
				qty: order.quantity,
				side: order.side,
				type: OrderType.Market,
				time_in_force: 'gtc',
			});
		});

		it('should set the id of the order with the id returned by the Alpaca API', async () => {
			await alpacaService.createOrder(order);
			expect(order.id).toEqual(orderResult.id);
		});

		it('should throw an OrderException if an error occurs', async () => {
			const error = new Error('Position creation failed');
			jest.spyOn(mockClient, 'createOrder').mockRejectedValueOnce(error);
			await expect(alpacaService.createOrder(order)).rejects.toThrow(
				new OrderException(error.message, OrderException.ORDER_REJECTED_CODE)
			);
		});
	});

	describe('getPositions', () => {
		it('should call getPositions on the client object', async () => {
			const mockPositions = [
				{
					asset_id: 'BTC',
					symbol: 'BTC',
					qty: 1,
					side: 'long',
					unrealized_pl: 10,
					exchange: 'NASDAQ',
				},
			];
			mockClient.getPositions = jest.fn().mockResolvedValueOnce(mockPositions);

			const result = await alpacaService.getPositions();
			expect(mockClient.getPositions).toHaveBeenCalled();
			expect(result.length).toBe(mockPositions.length);

			const expectedOrder = {
				id: mockPositions[0].asset_id,
				symbol: {
					name: mockPositions[0].symbol,
					exchangeName: mockPositions[0].exchange,
				},
				quantity: mockPositions[0].qty,
				side: OrderSide.Buy,
				pl: mockPositions[0].unrealized_pl,
				status: OrderStatus.Open,
			};
			expect(result[0]).toEqual(expectedOrder);
		});

		it('should return an empty array if getPositions returns an empty array', async () => {
			mockClient.getPositions = jest.fn().mockResolvedValueOnce([]);

			const result = await alpacaService.getPositions();
			expect(mockClient.getPositions).toHaveBeenCalled();
			expect(result.length).toBe(0);
		});

		it('should log and return an empty array if getPositions throws an error', async () => {
			const mockError = new Error('Failed to get positions');
			console.log = jest.fn();

			mockClient.getPositions = jest.fn().mockRejectedValueOnce(mockError);

			const result = await alpacaService.getPositions();
			expect(mockClient.getPositions).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledWith(mockError);
			expect(result.length).toBe(0);
		});
	});
});
