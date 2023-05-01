import { SMA } from 'technicalindicators';

import {
	OHLC,
	Symbol,
} from '@packages/common';
import { ExchangeCrypto } from '@packages/common/src/enums/exchanges-crypto';

import {
	PriceType,
	Sma,
} from './sma';

describe('Sma', () => {
	let sma: Sma;
	let values: OHLC[] = [];

	beforeEach(() => {
		values = [];
		sma = new Sma('test', 3, PriceType.Close);

		// Base OHLC value
		const baseOHLC = new OHLC(
			{ name: '', exchangeName: ExchangeCrypto.BNCU } as unknown as Symbol,
			1,
			2,
			3,
			4,
			0,
			new Date()
		);

		// Generate 10 datasets
		for (let i = 1; i <= 10; i++) {
			const open = baseOHLC.open + i;
			const high = baseOHLC.high + i;
			const low = baseOHLC.low + i;
			const close = baseOHLC.close + i;
			const time = new Date();

			const ohlc = new OHLC(
				{ name: '', exchangeName: ExchangeCrypto.BNCU } as unknown as Symbol,
				open,
				high,
				low,
				close,
				0,
				time
			);

			values.push(ohlc);
		}
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('constructor', () => {
		it('should create a new instance of SMA', () => {
			expect(sma['sma']).toBeInstanceOf(SMA);
		});

		it('should set the correct properties', () => {
			expect(sma['_name']).toBe('test');
			expect(sma['period']).toBe(3);
			expect(sma['values']).toEqual([]);
			expect(sma['price']).toBe(PriceType.Close);
		});
	});

	describe('init', () => {
		it('should initialize the values array with calculated SMA values', () => {
			sma.init(values);

			expect(sma['values']).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
		});

		it('should initialize the values array with calculated SMA values', () => {
			sma = new Sma('test', 5, PriceType.Close);

			sma.init(values);

			expect(sma['values']).toEqual([7, 8, 9, 10, 11, 12]);
		});
	});

	describe('nextValue', () => {
		it('should add the calculated SMA value to the values array', () => {
			sma = new Sma('test', 5, PriceType.Close);

			sma.init(values);

			sma.nextValue(
				new OHLC(
					{ name: '', exchangeName: ExchangeCrypto.BNCU } as unknown as Symbol,
					1,
					2,
					3,
					14,
					0,
					new Date()
				)
			);

			expect(sma['values']).toEqual([7, 8, 9, 10, 11, 12, 12.8]);
		});
	});

	describe('getValues', () => {
		it('should return the values array', () => {
			sma['values'] = [1, 2, 3];

			expect(sma.getValues()).toEqual([1, 2, 3]);
		});
	});

	describe('getLastValue', () => {
		it('should return the last value in the values array', () => {
			sma['values'] = [1, 2, 3];

			expect(sma.getLastValue()).toBe(3);
		});

		it('should return null if the values array is empty', () => {
			expect(sma.getLastValue()).toBeNull();
		});
	});

	describe('getValue', () => {
		it('should return the value at the given index', () => {
			sma['values'] = [1, 2, 3];

			expect(sma.getValue(1)).toBe(2);
		});

		it('should return null if the index is out of bounds', () => {
			sma['values'] = [1, 2, 3];

			expect(sma.getValue(10)).toBeNull();
		});
	});
});
