import { CandleType, OHLC } from './ohlc';
import { Symbol } from './symbol';

describe('OHLC', () => {
	const symbol = { symbol: 'BTCUSD', exchangeName: 'EXC' } as unknown as Symbol;
	const open = 1000;
	const high = 1500;
	const low = 900;
	const close = 1200;
	const volume = 10000;
	const timestamp = new Date();
	let ohlc: OHLC;

	beforeEach(() => {
		ohlc = new OHLC(symbol, open, high, low, close, volume, timestamp);
	});

	it('should create an instance', () => {
		expect(ohlc).toBeDefined();
	});

	it('should return candle type up', () => {
		expect(ohlc.candleType()).toBe(CandleType.Up);
	});

	it('should return candle type down', () => {
		const downOhlc = new OHLC(
			symbol,
			high,
			open,
			close,
			low,
			volume,
			timestamp
		);
		expect(downOhlc.candleType()).toBe(CandleType.Down);
	});

	it('should return candle type doji', () => {
		const dojiOhlc = new OHLC(
			symbol,
			close,
			close,
			close,
			close,
			volume,
			timestamp
		);
		expect(dojiOhlc.candleType()).toBe(CandleType.Doji);
	});

	it('should return true if candle is up', () => {
		expect(ohlc.isCandleUp()).toBe(true);
	});

	it('should return false if candle is not up', () => {
		const downOhlc = new OHLC(
			symbol,
			high,
			open,
			close,
			low,
			volume,
			timestamp
		);
		expect(downOhlc.isCandleUp()).toBe(false);
	});

	it('should return true if candle is down', () => {
		const downOhlc = new OHLC(
			symbol,
			high,
			open,
			close,
			low,
			volume,
			timestamp
		);
		expect(downOhlc.isCandleDown()).toBe(true);
	});

	it('should return false if candle is not down', () => {
		expect(ohlc.isCandleDown()).toBe(false);
	});

	it('should return true if candle is doji', () => {
		const dojiOhlc = new OHLC(
			symbol,
			close,
			close,
			close,
			close,
			volume,
			timestamp
		);
		expect(dojiOhlc.isCandleDoji()).toBe(true);
	});

	it('should return false if candle is not doji', () => {
		expect(ohlc.isCandleDoji()).toBe(false);
	});

	it('should return JSON representation of OHLC', () => {
		const json = ohlc.toJson();
		expect(json).toEqual({
			symbol,
			open,
			high,
			low,
			close,
			volume,
			timestamp,
		});
	});
});
