import { IIndicator } from '../../../indicators/src/iindicator';
import { OHLC } from '../models/ohlc';
import { Symbol } from '../models/symbol';
import { Tick } from '../models/tick';
import { Context } from './context';

describe('Context', (): void => {
	describe('getSymbols', (): void => {
		it('should return an empty array when no symbols are set', (): void => {
			const context = new Context();
			expect(context.getSymbols()).toEqual([]);
		});

		it('should return an array of symbols when symbols are set', (): void => {
			const context = new Context();
			const symbol = { name: 'BTCUSD' } as Symbol;
			context.setSymbol(symbol);
			expect(context.getSymbols()).toEqual([symbol]);
		});
	});
});

describe('Context', (): void => {
	describe('setSymbol', (): void => {
		it('should set a single symbol', (): void => {
			const context = new Context();
			const symbol = { name: 'BTCUSD' } as Symbol;
			context.setSymbol(symbol);
			expect(context.getSymbols()).toEqual([symbol]);
		});

		it('should set multiple symbols', (): void => {
			const context = new Context();
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
			const context = new Context();
			expect(context.getTicks()).toEqual([]);
		});

		it('should return an array of ticks when ticks are set', (): void => {
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
			expect(context.getOHLC()).toEqual([]);
		});

		it('should return an array of OHLC data when OHLC data is set', (): void => {
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
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
			const context = new Context();
			const mockIndicator1 = { name: 'test1', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			const mockIndicator2 = { name: 'test2', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator()).toEqual([mockIndicator1, mockIndicator2]);
		});

		it('should return the indicator with the specified name', (): void => {
			const context = new Context();
			const mockIndicator1 = { name: 'test1', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			const mockIndicator2 = { name: 'test2', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator('test2')).toBe(mockIndicator2);
		});

		it('should return undefined if the specified indicator does not exist', (): void => {
			const context = new Context();
			const mockIndicator1 = { name: 'test1', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			const mockIndicator2 = { name: 'test2', nextValue: jest.fn(), getValues: jest.fn() } as IIndicator;
			context.addIndicator(mockIndicator1);
			context.addIndicator(mockIndicator2);
			expect(context.getIndicator('test3')).toBeUndefined();
		});
	});
});
