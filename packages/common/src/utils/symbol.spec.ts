import { Symbol } from '../models/symbol';
import { getSymbolNameList } from './symbol';

describe('getSymbolNameList', () => {
	it("Doit retourner une liste de nom d'actif", () => {
		const symbols = [
			{
				name: 'BTCUSD',
				exchangeName: 'ERSX',
			} as Symbol,
		];
		const result = getSymbolNameList(symbols);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe('BTCUSD');
	});

	it("Doit retourner une liste de nom d'actif", () => {
		const symbols = [
			{
				name: 'BTCUSD',
				exchangeName: 'ERSX',
			} as Symbol,
			{
				name: 'BTCUSDT',
				exchangeName: 'ERSX',
			} as Symbol,
		];
		const result = getSymbolNameList(symbols);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe('BTCUSD');
		expect(result[1]).toBe('BTCUSDT');
	});
});
