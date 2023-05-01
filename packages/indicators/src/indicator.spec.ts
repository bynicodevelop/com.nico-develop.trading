import { OHLC } from '@packages/common';

import { IIndicator } from './iindicator';
import { Indicator } from './indicator';
import {
	PriceType,
	Sma,
} from './sma';

describe('Indicator', (): void => {
	let indicator: Indicator;

	beforeEach((): void => {
		jest.clearAllMocks();

		indicator = new Indicator();
	});

	it('should add an indicator', (): void => {
		const mockIndicator = {
			name: 'test',
			init: jest.fn(),
			nextValue: jest.fn(),
			getValues: jest.fn(),
		} as unknown as IIndicator;

		indicator.addIndicator(mockIndicator);
		expect(indicator['indicators']['test']).toBe(mockIndicator);
	});

	it('should call nextValue on all indicators', (): void => {
		const mockIndicator1 = new Sma('test1', 10, PriceType.Close);
		const mockIndicator2 = new Sma('test2', 10, PriceType.Close);

		mockIndicator1.nextValue = jest.fn();
		mockIndicator2.nextValue = jest.fn();

		indicator.addIndicator(mockIndicator1);
		indicator.addIndicator(mockIndicator2);

		indicator.init([]);

		const value = {
			open: 42,
			high: 42,
			low: 42,
			close: 42,
			volume: 42,
			timestamp: new Date(),
		} as OHLC;

		indicator.nextValue(value);

		expect(mockIndicator1.nextValue).toHaveBeenCalledWith(value);
		expect(mockIndicator2.nextValue).toHaveBeenCalledWith(value);
	});

	it('should return all indicators', (): void => {
		const mockIndicator1 = new Sma('test1', 10, PriceType.Close);
		const mockIndicator2 = new Sma('test2', 10, PriceType.Close);

		indicator.addIndicator(mockIndicator1);
		indicator.addIndicator(mockIndicator2);

		const indicators = indicator.get();

		expect(indicators).toContain(mockIndicator1);
		expect(indicators).toContain(mockIndicator2);
	});

	it('should return an indicator by name', (): void => {
		const mockIndicator = new Sma('test1', 10, PriceType.Close);

		indicator.addIndicator(mockIndicator);

		const indicatorByName = indicator.get('test1');
		expect(indicatorByName).toBe(mockIndicator);
	});

	it('should return undefined if indicator name is not found', (): void => {
		const mockIndicator = new Sma('test1', 10, PriceType.Close);

		indicator.addIndicator(mockIndicator);

		const indicatorByName = indicator.get('notfound');
		expect(indicatorByName).toBeUndefined();
	});
});
