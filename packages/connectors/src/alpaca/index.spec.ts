import { CryptoBar } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { AccountService } from '@packages/account';
import { ConnectorEvent, Context } from '@packages/common';
import { ExchangeCrypto } from '@packages/common/src/enums/exchanges-crypto';
import { Symbol } from '@packages/common/src/models/symbol';
import { Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

import { AlpacaConnector, AlpacaService } from './index';

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

const orderService = {} as unknown as OrderService;
const accountService = {} as unknown as AccountService;
const indicator = {} as unknown as Indicator;

describe('AlpacaConnector', (): void => {
	describe('isCurrentSymbol', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();

			alpacaServiceMock.onConnect = jest.fn(
				async (callback: () => void): Promise<void> => {
					callback();
				}
			);

			alpacaServiceMock.addObserver = jest.fn();
		});

		it('should return true if the symbol is in the context', (): void => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const symbol = {
				name: 'BTCUSD',
				exchangeName: ExchangeCrypto.ERSX,
			} as Symbol;

			connector['context'] = new Context(
				orderService,
				accountService,
				indicator
			);
			connector['context']['symbols'] = [symbol];

			const result = connector['isCurrentSymbol'](ExchangeCrypto.ERSX);

			expect(result).toBe(true);
		});

		it('should return false if the symbol is not in the context', (): void => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const symbol = {
				name: 'BTCUSD',
				exchangeName: ExchangeCrypto.ERSX,
			} as Symbol;

			connector['context'] = new Context(
				orderService,
				accountService,
				indicator
			);
			connector['context']['symbols'] = [symbol];

			const result = connector['isCurrentSymbol'](ExchangeCrypto.BNCU);

			expect(result).toBe(false);
		});
	});

	describe('cryptoQuoteToTick', (): void => {
		it('should return null if the symbol is not in the context', (): void => {
			const connector = new AlpacaConnector(alpacaServiceMock);

			connector['isCurrentSymbol'] = jest.fn().mockReturnValue(false);

			const result = connector['cryptoQuoteToTick']({
				Symbol: 'BTCUSD',
				Exchange: ExchangeCrypto.BNCU,
				AskPrice: 1,
				AskSize: 1,
				BidPrice: 1,
				BidSize: 1,
				Timestamp: '2020-01-01',
			});

			expect(result).toBeNull();
		});
	});

	describe('cryptoBarToOHLC', (): void => {
		it('should return null if the symbol is not in the context', (): void => {
			const connector = new AlpacaConnector(alpacaServiceMock);

			connector['isCurrentSymbol'] = jest.fn().mockReturnValue(false);

			const result = connector['cryptoBarToOHLC']({
				Symbol: 'BTCUSD',
				Exchange: ExchangeCrypto.BNCU,
				Open: 1,
				High: 1,
				Low: 1,
				Close: 1,
				Volume: 1,
				Timestamp: '2020-01-01',
			} as unknown as CryptoBar);

			expect(result).toBeNull();
		});
	});
});

describe('AlpacaConnector', (): void => {
	describe('run', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();

			alpacaServiceMock.onConnect = jest.fn(
				async (callback: () => void): Promise<void> => {
					callback();
				}
			);

			alpacaServiceMock.addObserver = jest.fn();
		});

		it('should emit the Authenticated event after a successful connection', async (): Promise<void> => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context(orderService, accountService, indicator);
			const authenticatedListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			connector['context'] = context;

			connector.on(ConnectorEvent.Authenticated, authenticatedListener);

			await connector.run();

			expect(authenticatedListener).toHaveBeenCalledTimes(1);
		});

		it('should check subscribeForQuotes is call', async (): Promise<void> => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context(orderService, accountService, indicator);
			alpacaServiceMock.subscribeForQuotes = jest.fn();

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn();

			await connector.run();

			expect(alpacaServiceMock.subscribeForQuotes).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.subscribeForQuotes).toHaveBeenCalledWith([
				'BTCUSD',
			]);
		});

		it('should check subscribeForBars is call', async (): Promise<void> => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn();
			alpacaServiceMock.subscribeForBars = jest.fn();

			await connector.run();

			expect(alpacaServiceMock.subscribeForBars).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.subscribeForBars).toHaveBeenCalledWith([
				'BTCUSD',
			]);
		});

		it('should set the tick and emit the Tick event when receiving from onCryptoQuote', async (): Promise<void> => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context(orderService, accountService, indicator);
			const tickListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn();
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

		it('should set the tick and emit the Tick event when receiving from onCryptoQuote', async (): Promise<void> => {
			const connector = new AlpacaConnector(alpacaServiceMock);
			const context = new Context(orderService, accountService, indicator);
			const barListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn();
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
