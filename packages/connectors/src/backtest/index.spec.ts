import { AccountService } from '@packages/account';
import {
	ConnectorEvent,
	Context,
	ExchangeCrypto,
	OHLC,
	Symbol,
	Tick,
} from '@packages/common';
import { IConnectorBacktestService } from '@packages/common/src/iconnector-backtest-service';
import { Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

import { BacktestConnector } from './';

const alpacaServiceMock: IConnectorBacktestService = {
	onConnect: jest.fn(),
	connect: jest.fn(),
	onError: jest.fn(),
	onCryptoQuote: jest.fn(),
	onCryptoBar: jest.fn(),
	subscribeForQuotes: jest.fn(),
	subscribeForBars: jest.fn(),
	getCryptoBars: jest.fn(),
	updatePrice: jest.fn(),
	updateDate: jest.fn(),
} as unknown as IConnectorBacktestService;

const orderService = {} as unknown as OrderService;
const accountService = {} as unknown as AccountService;
const indicator = {} as unknown as Indicator;

describe('BacktestConnector', (): void => {
	describe('run', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();

			alpacaServiceMock.onConnect = jest.fn((callback: () => void): void => {
				callback();
			});
		});

		it("Doit appeler l’événement après l'authentification du service", async (): Promise<void> => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);
			const authenticatedListener = jest.fn((ctx: Context): void => {
				expect(ctx).toEqual(context);
			});

			connector['context'] = context;

			connector.on(ConnectorEvent.Authenticated, authenticatedListener);

			await connector.run();

			expect(authenticatedListener).toHaveBeenCalledTimes(1);
			expect(authenticatedListener).toHaveBeenCalledWith(context);
		});

		it('Doit appeler la méthode getHistoricalOHLC', async (): Promise<void> => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn();

			await connector.run();

			expect(connector['getHistoricalOHLC']).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.updatePrice).toHaveBeenCalledTimes(0);
			expect(alpacaServiceMock.updateDate).toHaveBeenCalledTimes(0);
		});

		it('Doit appeler la méthode getHistoricalQuotes', async (): Promise<void> => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
				type: 'quotes',
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['getHistoricalQuotes'] = jest.fn();

			await connector.run();

			expect(connector['getHistoricalQuotes']).toHaveBeenCalledTimes(1);
			expect(alpacaServiceMock.updatePrice).toHaveBeenCalledTimes(0);
			expect(alpacaServiceMock.updateDate).toHaveBeenCalledTimes(0);
		});

		it('Doit appeler la méthode updatePrice et updateDate', async (): Promise<void> => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
				end: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			const data = [new OHLC({} as Symbol, 1, 1, 1, 1, 1, new Date())];

			connector['context'] = context;
			connector['getHistoricalOHLC'] = jest.fn().mockReturnValueOnce(data);

			await connector.run();

			expect(connector['getHistoricalOHLC']).toHaveBeenCalledTimes(1);
		});
	});

	describe('aggregateQuotes', (): void => {
		it('Doit ajouter un OHLC sur une liste vide', (): void => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;

			const quote = new Tick({} as Symbol, 1, 1, 1, 1, new Date());

			const result = connector['aggregateQuotes'](quote);

			expect(result).toBe(connector['_listOfOHLC'][0]);
		});

		it('Doit ajouter un OHLC sur une liste non vide', (): void => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			connector['context'] = context;
			connector['_listOfOHLC'] = [
				new OHLC(
					{} as Symbol,
					1,
					1,
					1,
					1,
					1,
					new Date(
						new Date().getFullYear(),
						new Date().getMonth(),
						new Date().getDate(),
						new Date().getHours(),
						new Date().getMinutes() - 1
					)
				),
			];

			const quote = new Tick({} as Symbol, 1, 1, 1, 1, new Date());

			const result = connector['aggregateQuotes'](quote);

			expect(connector['_listOfOHLC']).toHaveLength(2);
			expect(result).toBe(connector['_listOfOHLC'][1]);
		});

		it('Doit modifier un OHLC de la même date', (): void => {
			const connector = new BacktestConnector(alpacaServiceMock, {
				start: new Date(),
			});
			const context = new Context(orderService, accountService, indicator);

			context['symbols'] = [
				{
					name: 'BTCUSD',
					exchangeName: ExchangeCrypto.ERSX,
				},
			];

			const date = new Date();

			connector['context'] = context;
			connector['_listOfOHLC'] = [new OHLC({} as Symbol, 1, 1, 1, 1, 1, date)];

			const quote = new Tick({} as Symbol, 1, 1, 1, 1, date);

			const result = connector['aggregateQuotes'](quote);

			expect(result).toBeNull();
		});
	});
});
