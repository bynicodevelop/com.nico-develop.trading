import {
	ExchangeCrypto,
	OrderSide,
	OrderStatus,
	Position,
	Symbol,
} from '@packages/common';

import { Database } from '../database';
import { ConnectorOption } from '../options';
import { AlpacaBacktestService } from './alpaca-service';

jest.mock('@alpacahq/alpaca-trade-api', () => ({
	__esModule: true,
	default: jest.fn().mockReturnValue({}),
}));

describe('AlpacaBacktestService', () => {
	describe('calculatePL', () => {
		it("Doit retourner 500 à l'achat", () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Buy,
				closePrice: 100,
				openPrice: 50,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(500);
		});

		it('Doit retourner 500 la vente', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Sell,
				closePrice: 50,
				openPrice: 100,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(500);
		});

		it('Doit retourner 0 la vente', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Sell,
				closePrice: 100,
				openPrice: 100,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(0);
		});

		it("Doit retourner 0 à l'achat", () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Buy,
				closePrice: 50,
				openPrice: 50,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(0);
		});

		it('Doit retourner -500 la vente', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Sell,
				closePrice: 50,
				openPrice: 0,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(-500);
		});

		it("Doit retourner -500 à l'achat", () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = {
				quantity: 10,
				side: OrderSide.Buy,
				closePrice: 0,
				openPrice: 50,
			} as Position;
			const pl = alpacaService['calculatePL'](mockOrder);

			expect(pl).toEqual(-500);
		});
	});

	describe('calculatePlOnOpenPositions', () => {
		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Open,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnOpenPositions'](mockOrder);

			expect(pl).toEqual(1000);
		});

		it('Doit retourner 500 avec open sur achat', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnOpenPositions'](mockOrder);

			expect(pl).toEqual(500);
		});

		it('Doit retourner 500 avec open sur vente', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Open,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnOpenPositions'](mockOrder);

			expect(pl).toEqual(500);
		});

		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnOpenPositions'](mockOrder);

			expect(pl).toEqual(0);
		});

		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [] as Position[];

			const pl = alpacaService['calculatePlOnOpenPositions'](mockOrder);

			expect(pl).toEqual(0);
		});
	});

	describe('calculatePlOnClosedPositions', () => {
		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Open,
				} as Position,
			];
			const pl = alpacaService['calculatePlOnClosedPositions'](mockOrder);

			expect(pl).toEqual(0);
		});

		it('Doit retourner -500 avec close sur vente', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnClosedPositions'](mockOrder);

			expect(pl).toEqual(-500);
		});

		it('Doit retourner 500 avec close sur achat', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Open,
				} as Position,
			];
			const pl = alpacaService['calculatePlOnClosedPositions'](mockOrder);

			expect(pl).toEqual(500);
		});

		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculatePlOnClosedPositions'](mockOrder);

			expect(pl).toEqual(0);
		});

		it('Doit retourner 0', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const mockOrder = [] as Position[];
			const pl = alpacaService['calculatePlOnClosedPositions'](mockOrder);

			expect(pl).toEqual(0);
		});
	});

	describe('calculateBalance', () => {
		it('Doit retourner 1500 avec 1 gain', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['balance'] = 1000;

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
			];
			const pl = alpacaService['calculateBalance'](mockOrder);

			expect(pl).toEqual(1500);
		});

		it('Doit retourner 2000 avec 2 gains', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['balance'] = 1000;

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculateBalance'](mockOrder);

			expect(pl).toEqual(2000);
		});

		it('Doit retourner 1000 avec un gain et une perte', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['balance'] = 1000;

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculateBalance'](mockOrder);

			expect(pl).toEqual(1000);
		});

		it('Doit retourner 0 avec 2 pertes', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['balance'] = 1000;

			const mockOrder = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 50,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 50,
					status: OrderStatus.Closed,
				} as Position,
			];

			const pl = alpacaService['calculateBalance'](mockOrder);

			expect(pl).toEqual(0);
		});
	});

	describe('updatePrice', () => {
		it('Doit mettre à jour le prix', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['price'] = 1000;

			alpacaService['updatePrice'](2000);

			expect(alpacaService['price']).toEqual(2000);
		});

		it('Doit mettre à jour le prix des ordres ouverts', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			alpacaService['price'] = 1000;
			alpacaService['_orders'] = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
			];

			alpacaService['updatePrice'](2000);

			expect(alpacaService['_orders'][0].closePrice).toEqual(2000);
			expect(alpacaService['_orders'][1].closePrice).toEqual(2000);
		});
	});

	describe('updateDate', () => {
		it('Doit mettre à jour la date', () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);
			const date = new Date();

			alpacaService['updateDate'](date);

			expect(alpacaService['date']).toEqual(date);
		});
	});

	describe('getCryptoQuotes', () => {
		it('Doit retourner un quote', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['client']['getCryptoQuotes'] = jest
				.fn()
				.mockReturnValue({});

			const quotes = await alpacaService.getCryptoQuotes(['BTCUSD'], {});

			expect(quotes).toEqual({});
			expect(alpacaService['client']['getCryptoQuotes']).toHaveBeenCalledWith(
				['BTCUSD'],
				{}
			);
		});
	});

	describe('getCryptoBars', () => {
		it('Doit retourner un bar', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['client']['getCryptoBars'] = jest.fn().mockReturnValue({});

			const quotes = await alpacaService.getCryptoBars(['BTCUSD'], {});

			expect(quotes).toEqual({});
			expect(alpacaService['client']['getCryptoBars']).toHaveBeenCalledWith(
				['BTCUSD'],
				{}
			);
		});
	});

	describe('createOrder', () => {
		it('Doit créer un ordre à 1000 euros', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['price'] = 1000;
			alpacaService['date'] = new Date();
			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			const order = await alpacaService.createOrder({
				quantity: 10,
				side: OrderSide.Buy,
			} as Position);

			expect(order.openPrice).toEqual(1000);
			expect(order.closePrice).toEqual(1000);
			expect(order.openDate).toEqual(alpacaService['date']);
			expect(order.closeDate).toEqual(alpacaService['date']);

			expect(alpacaService['database']['createPosition']).toHaveBeenCalledTimes(
				1
			);
		});

		it('Doit créer un ordre à 500 euros', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['price'] = 500;
			alpacaService['date'] = new Date();
			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			const order = await alpacaService.createOrder({
				quantity: 10,
				side: OrderSide.Buy,
			} as Position);

			expect(order.openPrice).toEqual(500);
			expect(order.closePrice).toEqual(500);
			expect(order.openDate).toEqual(alpacaService['date']);
			expect(order.closeDate).toEqual(alpacaService['date']);
			expect(alpacaService['database']['createPosition']).toHaveBeenCalledTimes(
				1
			);
		});

		it('Doit créer 2 ordres à 500 euros', async () => {
			jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['price'] = 500;
			alpacaService['date'] = new Date();
			alpacaService['database'] = {
				createPosition: jest.fn(),
			} as unknown as Database;

			const order1 = await alpacaService.createOrder({
				quantity: 10,
				side: OrderSide.Buy,
			} as Position);
			const order2 = await alpacaService.createOrder({
				quantity: 10,
				side: OrderSide.Buy,
			} as Position);

			expect(order1.openPrice).toEqual(500);
			expect(order1.closePrice).toEqual(500);
			expect(order1.openDate).toEqual(alpacaService['date']);
			expect(order1.closeDate).toEqual(alpacaService['date']);
			expect(order2.openPrice).toEqual(500);
			expect(order2.closePrice).toEqual(500);
			expect(order2.openDate).toEqual(alpacaService['date']);
			expect(order2.closeDate).toEqual(alpacaService['date']);

			expect(alpacaService['database']['createPosition']).toHaveBeenCalledTimes(
				2
			);
		});
	});

	describe('getPositions', () => {
		it('Doit retourner les positions', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const data = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
			];

			alpacaService['database'] = {
				getPositions: jest.fn().mockResolvedValue(data) as any,
			} as Database;

			const positions = await alpacaService.getPositions();

			expect(positions).toEqual(data);
		});
	});

	describe('closePosition', () => {
		it('Doit fermer une position', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['price'] = 1000;

			alpacaService['_orders'] = [
				{
					symbol: {
						name: 'USD',
						exchangeName: ExchangeCrypto.BNCU,
					} as Symbol,
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
				{
					symbol: {
						name: 'EUR',
						exchangeName: ExchangeCrypto.BNCU,
					} as Symbol,
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 0,
					openPrice: 1000,
					status: OrderStatus.Open,
				} as Position,
			];

			const position = await alpacaService.closePosition(
				alpacaService['_orders'][0].id
			);

			expect(position).toEqual(alpacaService['_orders'][0]);
			expect(position.status).toEqual(OrderStatus.Closed);
			expect(position.closePrice).toEqual(1000);
			expect(position.closeDate).toEqual(alpacaService['date']);
		});
	});

	describe('getAccount', () => {
		it('Doit retourner le compte avec des positions ouvertes', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['_orders'] = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 200,
					openPrice: 100,
					status: OrderStatus.Open,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 200,
					status: OrderStatus.Open,
				} as Position,
			];

			const account = await alpacaService.getAccount();

			expect(account.id).toEqual('backtest');
			expect(account.currency).toEqual('USD');
			expect(account.balance).toEqual(1000);
			expect(account.pl).toEqual(2000);
			expect(account.equity).toEqual(3000);
		});

		it('Doit retourner le compte avec des positions fermées', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['_orders'] = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 200,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 200,
					status: OrderStatus.Closed,
				} as Position,
			];

			const account = await alpacaService.getAccount();

			expect(account.id).toEqual('backtest');
			expect(account.currency).toEqual('USD');
			expect(account.balance).toEqual(3000);
			expect(account.pl).toEqual(0);
			expect(account.equity).toEqual(3000);
		});

		it('Doit retourner le compte avec des positions ouvertes et fermées', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			alpacaService['_orders'] = [
				{
					quantity: 10,
					side: OrderSide.Buy,
					closePrice: 200,
					openPrice: 100,
					status: OrderStatus.Closed,
				} as Position,
				{
					quantity: 10,
					side: OrderSide.Sell,
					closePrice: 100,
					openPrice: 200,
					status: OrderStatus.Open,
				} as Position,
			];

			const account = await alpacaService.getAccount();

			expect(account.id).toEqual('backtest');
			expect(account.currency).toEqual('USD');
			expect(account.balance).toEqual(2000);
			expect(account.pl).toEqual(1000);
			expect(account.equity).toEqual(3000);
		});

		it('Doit retourner le compte sans positions', async () => {
			const alpacaService = new AlpacaBacktestService(
				{} as ConnectorOption,
				1000
			);

			const account = await alpacaService.getAccount();

			expect(account.id).toEqual('backtest');
			expect(account.currency).toEqual('USD');
			expect(account.balance).toEqual(1000);
			expect(account.pl).toEqual(0);
			expect(account.equity).toEqual(1000);
		});
	});
});
