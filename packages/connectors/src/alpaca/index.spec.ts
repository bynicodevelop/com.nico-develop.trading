import {
	ConnectorEvent,
	Context,
} from '@packages/common';
import { ExchangeCrypto } from '@packages/common/src/enums/exchanges-crypto';
import { Symbol } from '@packages/common/src/models/symbol';

import {
	AlpacaConnector,
	AlpacaService,
} from './index';

const alpacaServiceMock: AlpacaService = {
	onConnect: jest.fn(),
	connect: jest.fn(),
	onError: jest.fn(),
	onCryptoQuote: jest.fn(),
	onCryptoBar: jest.fn(),
	subscribeForQuotes: jest.fn(),
	subscribeForBars: jest.fn(),
	getCryptoBars: jest.fn(),
} as unknown as AlpacaService;

describe('AlpacaConnector', () => {
	describe('isCurrentSymbol', () => {
		it('should return true if the symbol is in the context', () => {
			const connector = new AlpacaConnector({} as AlpacaService);
			const symbol = {
				name: 'BTCUSD',
				exchangeName: ExchangeCrypto.ERSX,
			} as Symbol;

			connector['context'] = new Context();
			connector['context']['symbols'] = [symbol];

			const result = connector['isCurrentSymbol'](ExchangeCrypto.ERSX);

			expect(result).toBe(true);
		});

		it('should return false if the symbol is not in the context', () => {
			const connector = new AlpacaConnector({} as AlpacaService);
			const symbol = {
				name: 'BTCUSD',
				exchangeName: ExchangeCrypto.ERSX,
			} as Symbol;

			connector['context'] = new Context();
			connector['context']['symbols'] = [symbol];

			const result = connector['isCurrentSymbol'](ExchangeCrypto.BNCU);

			expect(result).toBe(false);
		});
	});
});

describe('AlpacaConnector', () => {
	describe('run', () => {
		beforeEach(() => {
			jest.clearAllMocks();

			alpacaServiceMock.onConnect = jest.fn((callback: () => void): void => {
				callback();
			});
		});

		it('should emit the Authenticated event after a successful connection', async () => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context();

			connector['context'] = context;

			const authenticatedListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			connector.on(ConnectorEvent.Authenticated, authenticatedListener);

			await connector.run();

			expect(authenticatedListener).toHaveBeenCalledTimes(1);
		});

		it('should check subscribeForQuotes is call', async () => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context();

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;

			alpacaServiceMock.subscribeForQuotes = jest.fn();

			await connector.run();

			expect(alpacaServiceMock.subscribeForQuotes).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.subscribeForQuotes).toHaveBeenCalledWith([
				'BTCUSD',
			]);
		});

		it('should check subscribeForBars is call', async () => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context();

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;

			alpacaServiceMock.subscribeForBars = jest.fn();

			await connector.run();

			expect(alpacaServiceMock.subscribeForBars).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.subscribeForBars).toHaveBeenCalledWith([
				'BTCUSD',
			]);
		});

		it('should set the tick and emit the Tick event when receiving from onCryptoQuote', async () => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context();

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;

			const tickListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			connector.on(ConnectorEvent.Tick, tickListener);

			const tick = {
				symbol: 'BTCUSD',
				Exchange: ExchangeCrypto.ERSX,
				ask: 1,
				bid: 2,
				last: 3,
				askSize: 4,
				bidSize: 5,
				lastSize: 6,
				volume: 7,
				quoteTime: new Date(),
			};

			alpacaServiceMock.onCryptoQuote = jest.fn((callback) => {
				callback(tick);
			});

			await connector.run();

			expect(tickListener).toHaveBeenCalledTimes(1);
		});

		it('should set the tick and emit the Tick event when receiving from onCryptoQuote', async () => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context();

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;

			const barListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			connector.on(ConnectorEvent.OHLC, barListener);

			const bar = {
				symbol: 'BTCUSD',
				Exchange: ExchangeCrypto.ERSX,
				open: 1,
				high: 2,
				low: 3,
				close: 4,
				volume: 5,
				barTime: new Date(),
			};

			alpacaServiceMock.onCryptoBar = jest.fn((callback) => {
				callback(bar);
			});

			await connector.run();

			expect(barListener).toHaveBeenCalledTimes(1);
		});
	});
});
