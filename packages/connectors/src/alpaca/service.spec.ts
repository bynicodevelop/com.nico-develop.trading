import Alpaca from '@alpacahq/alpaca-trade-api';
import { AlpacaCryptoClient } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/crypto_websocket_v2';
import {
	ExchangeCrypto,
	OrderSide,
	OrderStatus,
	OrderType,
	Position,
	Symbol,
} from '@packages/common';

import { Database } from '../database';
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

	describe('Doit être défini', () => {
		it('Option est défini', () => {
			expect(alpacaService).toBeDefined();
			expect(alpacaService['_option']).toBeDefined();

			expect(alpacaService['_option']['DATABASE_PATH']).toBeUndefined();
		});
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

	describe('savePosition', () => {
		beforeEach(() => {
			jest.clearAllMocks();

			alpacaService = new AlpacaService({ KEY: 'key', SECRET: 'secret' });
		});

		it('Doit créer une nouvelle position en base de données', async (): Promise<void> => {
			const position = {
				id: 'id',
				status: OrderStatus.Open,
			} as Position;

			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			await alpacaService['savePosition'](position);

			expect(alpacaService['database']['createPosition']).toHaveBeenCalledWith(
				position
			);
		});

		it('Doit mettre à jour une position existante en base de données lors de la clôture', async (): Promise<void> => {
			const position = {
				id: 'id',
				status: OrderStatus.Closed,
			} as Position;

			alpacaService['database'] = {
				closePosition: jest.fn(),
			} as unknown as Database;

			await alpacaService['savePosition'](position);

			expect(alpacaService['database']['closePosition']).toHaveBeenCalledWith(
				position
			);
		});

		it('Doit mettre à jour une position existante en base de données lors de la mise à jour de ses données', async (): Promise<void> => {
			const position = {
				id: 'id',
				status: OrderStatus.Open,
				closePrice: 1,
			} as Position;

			alpacaService['database'] = {
				updatePosition: jest.fn(),
			} as unknown as Database;

			await alpacaService['savePosition'](position);

			expect(alpacaService['database']['updatePosition']).toHaveBeenCalledWith(
				position
			);
		});

		it("Doit ne rien faire si la position n'existe pas en base de données", async (): Promise<void> => {
			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			await alpacaService['savePosition']({} as Position);

			expect(alpacaService['database']['createPosition']).toHaveBeenCalledTimes(
				0
			);
		});
	});

	describe('findPositionBySymbolName', () => {
		let positions: any[];
		beforeEach(() => {
			positions = [
				{
					id: 'id',
					symbol: 'AAPL',
				},
				{
					id: 'id2',
					symbol: 'TSLA',
				},
			];
		});

		it('Doit retourner la position correspondante au symbole', (): void => {
			expect(
				alpacaService['findPositionBySymbolName'](positions, 'AAPL')
			).toEqual(positions[0]);
		});

		it('Doit retourner la position correspondante au symbole', (): void => {
			expect(
				alpacaService['findPositionBySymbolName'](positions, 'TSLA')
			).toEqual(positions[1]);
		});

		it('Doit retourner undefined si aucune position ne correspond au symbole', (): void => {
			expect(
				alpacaService['findPositionBySymbolName'](positions, 'GOOG')
			).toBeUndefined();
		});
	});

	describe('createPositionModel', (): void => {
		it("Doit retourner une exception si l'id n'est pas renseigné", (): void => {
			expect(() => {
				alpacaService['createPositionModel']({} as any);
			}).toThrow('Position id is required');
		});

		it("Doit retourner une exception si le symbole n'est pas renseigné", (): void => {
			expect(() => {
				alpacaService['createPositionModel']({ id: 'id' } as any);
			}).toThrow('Position symbol is required');
		});

		it("Doit retourner une exception si le symbole n'est pas de type 'Symbol'", (): void => {
			expect(() => {
				alpacaService['createPositionModel']({
					id: 'id',
					symbol: 'AAPL',
				} as any);
			}).toThrow('Position symbol must be of type Symbol');
		});

		it("Doit retourner une exception si la quantité n'est pas renseignée", (): void => {
			expect(() => {
				alpacaService['createPositionModel']({
					id: 'id',
					symbol: {
						name: 'AAPL',
						exchangeName: ExchangeCrypto.CBSE,
					} as Symbol,
				} as any);
			}).toThrow('Position quantity is required');
		});

		it("Doit retourner une exception si 'side' n'est pas renseigné", (): void => {
			expect(() => {
				alpacaService['createPositionModel']({
					id: 'id',
					symbol: {
						name: 'AAPL',
						exchangeName: ExchangeCrypto.CBSE,
					} as Symbol,
					quantity: 10,
				} as any);
			}).toThrow('Position side is required');
		});

		it("Doit retourner les éléments minium d'une position", (): void => {
			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Buy,
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_quantity: 10,
				_side: OrderSide.Buy,
				_status: OrderStatus.Open,
				_openPrice: 0,
				_closePrice: 0,
				_openDate: null,
				_closeDate: null,
				_pl: 0,
			});
		});

		it("Doit retourner les éléments minium d'une position avec des données non formatées", (): void => {
			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Buy,
				status: 'open',
				openPrice: '10',
				closePrice: '10',
				pl: '10',
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_side: OrderSide.Buy,
				_status: OrderStatus.Open,
				_quantity: 10,
				_openPrice: 10,
				_closePrice: 10,
				_openDate: null,
				_closeDate: null,
				_pl: 10,
			});
		});

		it('Doit retourner un objet formaté avec des dates', (): void => {
			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Buy,
				status: 'open',
				openPrice: '10',
				closePrice: '10',
				pl: '10',
				openDate: '2020-01-01 00:00:00',
				closeDate: '2020-01-01 00:00:00',
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_side: OrderSide.Buy,
				_status: OrderStatus.Open,
				_quantity: 10,
				_openPrice: 10,
				_closePrice: 10,
				_openDate: new Date('2020-01-01 00:00:00'),
				_closeDate: new Date('2020-01-01 00:00:00'),
				_pl: 10,
			});
		});

		it('Doit retourner un objet formaté avec valeur de type date', (): void => {
			const date = new Date();

			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Buy,
				status: 'open',
				openPrice: '10',
				closePrice: '10',
				pl: '10',
				openDate: date,
				closeDate: date,
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_side: OrderSide.Buy,
				_status: OrderStatus.Open,
				_quantity: 10,
				_openPrice: 10,
				_closePrice: 10,
				_openDate: date,
				_closeDate: date,
				_pl: 10,
			});
		});

		it("Doit vérifier que la valeur de 'side' et status est valide", (): void => {
			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Sell,
				status: OrderStatus.Closed,
				openPrice: '10',
				closePrice: '10',
				pl: '10',
				openDate: '2020-01-01 00:00:00',
				closeDate: '2020-01-01 00:00:00',
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_side: OrderSide.Sell,
				_status: OrderStatus.Closed,
				_quantity: 10,
				_openPrice: 10,
				_closePrice: 10,
				_openDate: new Date('2020-01-01 00:00:00'),
				_closeDate: new Date('2020-01-01 00:00:00'),
				_pl: 10,
			});
		});

		it('Doit retourner que les status est open si non renseigné', (): void => {
			const position = {
				id: 'id',
				symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Sell,
				openPrice: '10',
				closePrice: '10',
				pl: '10',
				openDate: '2020-01-01 00:00:00',
				closeDate: '2020-01-01 00:00:00',
			} as any;

			expect(alpacaService['createPositionModel'](position)).toEqual({
				_id: 'id',
				_symbol: {
					name: 'AAPL',
					exchangeName: 'NASDAQ',
				} as unknown as Symbol,
				_side: OrderSide.Sell,
				_status: OrderStatus.Open,
				_quantity: 10,
				_openPrice: 10,
				_closePrice: 10,
				_openDate: new Date('2020-01-01 00:00:00'),
				_closeDate: new Date('2020-01-01 00:00:00'),
				_pl: 10,
			});
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
			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			alpacaService['observable'] = jest.fn();

			mockClient.getPosition = jest.fn();

			await alpacaService.createOrder(order);

			expect(mockClient.createOrder).toHaveBeenCalledWith({
				client_order_id: order.id,
				symbol: order.symbol.name,
				qty: order.quantity,
				side: order.side,
				type: OrderType.Market,
				time_in_force: 'gtc',
			});
		});

		it("Doit compléter les information de l'ordre", async () => {
			const order = {
				id: '123',
				symbol: { name: 'AAPL', exchangeName: 'NASDAQ' } as unknown as Symbol,
				quantity: 10,
				side: OrderSide.Buy,
				pl: 0,
			} as Position;

			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			mockClient.createOrder = jest.fn().mockResolvedValue(orderResult);
			mockClient.getPosition = jest.fn().mockResolvedValue({
				...order,
			});

			await alpacaService.createOrder(order);

			expect(alpacaService['database']['createPosition']).toHaveBeenCalledWith(
				order
			);

			expect(order.id).toEqual('123');
			expect(order.status).toEqual(OrderStatus.Open);
			expect(order.openDate).toBeDefined();
		});
	});

	describe('filterOpenPositions', () => {
		it('should return only open positions', () => {
			const positions = [
				{
					id: '1',
					status: OrderStatus.Open,
				},
				{
					id: '2',
					status: OrderStatus.Closed,
				},
			] as Position[];

			expect(alpacaService['filterOpenPositions'](positions)).toEqual([
				positions[0],
			]);
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

			const savedPositions = [
				{
					id: mockPositions[0].asset_id,
					symbolName: mockPositions[0].symbol,
					exchangeName: mockPositions[0].exchange,
					quantity: mockPositions[0].qty,
					side: OrderSide.Buy,
					pl: mockPositions[0].unrealized_pl,
					openPrice: 10,
					openDate: new Date(),
				},
			];

			mockClient.getPositions = jest.fn().mockResolvedValue(mockPositions);
			alpacaService['database'] = {
				updatePosition: jest.fn(),
			} as unknown as Database;
			alpacaService['syncPositions'] = jest.fn().mockResolvedValue([
				{
					id: mockPositions[0].asset_id,
					symbol: {
						name: mockPositions[0].symbol,
						exchangeName: mockPositions[0].exchange,
					},
					quantity: mockPositions[0].qty,
					side: OrderSide.Buy,
					pl: mockPositions[0].unrealized_pl,
					status: OrderStatus.Open,
					openPrice: savedPositions[0].openPrice,
					openDate: savedPositions[0].openDate,
				},
			]);

			const result = await alpacaService.getPositions();

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
				openPrice: savedPositions[0].openPrice,
				openDate: savedPositions[0].openDate,
			};

			expect(result[0]).toEqual(expectedOrder);
		});

		it('should return an empty array if getPositions returns an empty array', async () => {
			const mockDatabase = {
				getPositions: jest.fn().mockResolvedValueOnce([]),
			} as unknown as Database;

			alpacaService['database'] = mockDatabase;

			const result = await alpacaService.getPositions();

			expect(mockDatabase.getPositions).toHaveBeenCalled();
			expect(result.length).toBe(0);
		});

		it("Doit retourner une erreur si l'ordre n'est pas trouvé via l'ID", async () => {});
	});

	describe('closePosition', () => {
		it('should call closePosition on the client object', async () => {
			const mockPosition = {
				asset_id: 'BTC',
				symbol: 'BTC',
				qty: 1,
				side: 'long',
				unrealized_pl: 10,
				exchange: 'NASDAQ',
			};

			const date = new Date();

			const savedPosition = {
				id: mockPosition.asset_id,
				symbol: {
					name: mockPosition.symbol,
					exchangeName: mockPosition.exchange,
				},
				quantity: mockPosition.qty,
				side: OrderSide.Buy,
				status: OrderStatus.Closed,
				pl: mockPosition.unrealized_pl,
				openPrice: 10,
				openDate: date,
				closeDate: date,
			};

			mockClient.closePosition = jest.fn().mockResolvedValueOnce(mockPosition);

			alpacaService['observable'] = jest.fn();
			alpacaService['syncPositions'] = jest.fn();
			alpacaService['findPositionBySymbolName'] = jest.fn();

			alpacaService['database'] = {
				closePosition: jest.fn().mockResolvedValueOnce(savedPosition),
				getPosition: jest.fn().mockResolvedValueOnce(savedPosition),
			} as unknown as Database;

			const result = await alpacaService.closePosition('uuid');

			expect(mockClient.closePosition).toHaveBeenCalled();
			expect(alpacaService['observable']).toHaveBeenCalledTimes(1);

			expect(result).toMatchObject({
				id: mockPosition.asset_id,
				symbol: {
					name: mockPosition.symbol,
					exchangeName: mockPosition.exchange,
				},
				quantity: mockPosition.qty,
				side: OrderSide.Buy,
				pl: mockPosition.unrealized_pl,
				status: OrderStatus.Closed,
				openPrice: savedPosition.openPrice,
				openDate: savedPosition.openDate,
			});

			expect(result.closeDate).toBeDefined();
		});
	});
});
