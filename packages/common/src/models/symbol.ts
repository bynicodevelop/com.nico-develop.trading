import { ExchangeCrypto } from '../enums/exchanges-crypto';

interface ISymbol {
	name: string;
	exchangeName: ExchangeCrypto;
}

export type Symbol = ISymbol;
