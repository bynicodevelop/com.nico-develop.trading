import { Indicator } from '../../../indicators';
import { IIndicator } from '../../../indicators/src/iindicator';
import { OrderService } from '../../../orders';
import { OHLC } from '../models/ohlc';
import { Symbol } from '../models/symbol';
import { Tick } from '../models/tick';
import { Context } from './context';

const orderService = {} as unknown as OrderService;
const indicator = new Indicator();

describe('Context', (): void => {
	describe('getSymbols', (): void => {
		it('should return an empty array when no symbols are set', (): void => {
			const context = new Context(orderService, indicator);
			expect(context.getSymbols()).toEqual([]);
		});

		it('should return an array of symbols when symbols are set', (): void => {
			const context = new Context(orderService, indicator);
			const symbol = { name: 'BTCUSD' } as Symbol;
			context.setSymbol(symbol);
			expect(context.getSymbols()).toEqual([symbol]);
		});
	});
});

describe('Context', (): void => {
	describe('setSymbol', (): void => {
		it('should set a single symbol', (): void => {
			const context = new Context(orderService, indicator);
			const symbol = { name: 'BTCUSD' } as Symbol;
			context.setSymbol(symbol);
			expect(context.getSymbols()).toEqual([symbol]);
		});

		it('should set multiple symbols', (): void => {
			const context = new Context(orderService, indicator);
			const symbols = [
				{ name: 'BTCUSD' } as Symbol,
				{ name: 'GOOGL' } as Symbol,
			];
			context.setSymbol(symbols);
			expect(context.getSymbols()).toEqual(symbols);
		});
	});
});

describe('Context', (): void => {
	describe('getTicks', (): void => {
		it('should return an empty array when no ticks are set', (): void => {
			const context = new Context(orderService, indicator);
			expect(context.getTicks()).toEqual([]);
		});

		it('should return an array of ticks when ticks are set', (): void => {
			const context = new Context(orderService, indicator);
			const tick = new Tick(
				{ name: 'GOOGL' } as Symbol,
				1,
				1,
				1,
				1,
				new Date()
			);
			context.setTick(tick);
			expect(context.getTicks()).toEqual([tick]);
		});
	});
});

describe('Context', (): void => {
	describe('setTick', (): void => {
		it('should set a single tick', (): void => {
			const context = new Context(orderService, indicator);
			const tick = new Tick(
				{ name: 'GOOGL' } as Symbol,
				1,
				1,
				1,
				1,
				new Date()
			);
			context.setTick(tick);
			expect(context.getTicks()).toEqual([tick]);
		});

		it('should set multiple ticks', (): void => {
			const context = new Context(orderService, indicator);
			const ticks = [
				new Tick({ name: 'APPL' } as Symbol, 1, 1, 1, 1, new Date()),
				new Tick({ name: 'GOOGL' } as Symbol, 1, 1, 1, 1, new Date()),
			];
			context.setTick(ticks);
			expect(context.getTicks()).toEqual(ticks);
		});
	});
});

describe('Context', (): void => {
	describe('getOHLC', (): void => {
		it('should return an empty array when no OHLC data is set', (): void => {
			const context = new Context(orderService, indicator);
			expect(context.getOHLC()).toEqual([]);
		});

		it('should return an array of OHLC data when OHLC data is set', (): void => {
			const context = new Context(orderService, indicator);
			const ohlc = [
				{
					symbol: { name: 'AAPL' } as Symbol,
					open: 100,
					high: 120,
					low: 90,
					close: 110,
				} as OHLC,
				{
					symbol: { name: 'GOOG' } as Symbol,
					open: 200,
					high: 220,
					low: 180,
					close: 210,
				} as OHLC,
			];
			context.setOHLC(ohlc);
			expect(context.getOHLC()).toEqual(ohlc);
		});
	});
});

describe('Context', (): void => {
	describe('setOHLC', (): void => {
		it('should set a single OHLC data', (): void => {
			const context = new Context(orderService, indicator);
			const ohlc = {
				symbol: { name: 'AAPL' } as Symbol,
				open: 100,
				high: 120,
				low: 90,
				close: 110,
			} as OHLC;
			context.setOHLC(ohlc);
			expect(context.getOHLC()).toEqual([ohlc]);
		});

		it('should set multiple OHLC data', (): void => {
			const context = new Context(orderService, indicator);
			const ohlc = [
				{
					symbol: { name: 'AAPL' } as Symbol,
					open: 100,
					high: 120,
					low: 90,
					close: 110,
				} as OHLC,
				{
					symbol: { name: 'GOOG' } as Symbol,
					open: 200,
					high: 220,
					low: 180,
					close: 210,
				} as OHLC,
			];
			context.setOHLC(ohlc);
			expect(context.getOHLC()).toEqual(ohlc);
		});

		it('should add new OHLC data to existing data', (): void => {
			const context = new Context(orderService, indicator);
			const ohlc1 = {
				symbol: { name: 'AAPL' } as Symbol,
				open: 100,
				high: 120,
				low: 90,
				close: 110,
			} as OHLC;
			const ohlc2 = {
				symbol: { name: 'GOOG' } as Symbol,
				open: 200,
				high: 220,
				low: 180,
				close: 210,
			} as OHLC;
			context.setOHLC(ohlc1);
			context.setOHLC(ohlc2);
			expect(context.getOHLC()).toEqual([ohlc1, ohlc2]);
		});

		it('should add new OHLC data to existing data when setting an array', (): void => {
			const context = new Context(orderService, indicator);
			const ohlc1 = {
				symbol: { name: 'AAPL' } as Symbol,
				open: 100,
				high: 120,
				low: 90,
				close: 110,
			} as OHLC;
			const ohlc2 = {
				symbol: { name: 'GOOG' } as Symbol,
				open: 200,
				high: 220,
				low: 180,
				close: 210,
			} as OHLC;
			context.setOHLC(ohlc1);
			context.setOHLC([ohlc2]);
			expect(context.getOHLC()).toEqual([ohlc1, ohlc2]);
		});
	});
});

describe('Context', (): void => {
	describe('getIndicator', (): void => {
		it('should return all indicators when no name is provided', (): void => {
			const context = new Context(orderService, indicator);
			const mockIndicator1 = {
				name: 'test1',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			const mockIndicator2 = {
				name: 'test2',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator()).toEqual([mockIndicator1, mockIndicator2]);
		});

		it('should return the indicator with the specified name', (): void => {
			const context = new Context(orderService, indicator);
			const mockIndicator1 = {
				name: 'test1',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			const mockIndicator2 = {
				name: 'test2',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator('test2')).toBe(mockIndicator2);
		});

		it('should return undefined if the specified indicator does not exist', (): void => {
			const context = new Context(orderService, indicator);
			const mockIndicator1 = {
				name: 'test1',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			const mockIndicator2 = {
				name: 'test2',
				init: jest.fn(),
				nextValue: jest.fn(),
				getValues: jest.fn(),
			} as unknown as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator('test3')).toBeUndefined();
		});
	});
});
