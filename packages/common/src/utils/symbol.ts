import { Symbol } from '../models/symbol';

export const getSymbolNameList = (symbols: Symbol[]): string[] => {
	return symbols.map((symbol): string => symbol.name);
};
