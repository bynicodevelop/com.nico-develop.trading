import { AccountService } from '@packages/account';
import { IIndicator, Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

import { OHLC } from '../models/ohlc';
import { Symbol } from '../models/symbol';
import { Tick } from '../models/tick';
import { LoggerService } from './logger';

export class Context {
	private logger: LoggerService;
	private symbols: Symbol[] = [];
	private ticks: Tick[] = [];
	private ohlc: OHLC[] = [];

	constructor(
		private orderService: OrderService,
		private accountService: AccountService,
		private indicator: Indicator
	) {
		this.logger = new LoggerService();
	}

	getLogger(): LoggerService {
		return this.logger;
	}

	getSymbols(): Symbol[] {
		return this.symbols;
	}

	setSymbol(symbol: Symbol | Symbol[]): void {
		if (Array.isArray(symbol)) {
			this.symbols = [...this.symbols, ...symbol];
			return;
		}

		this.symbols.push(symbol);
	}

	getTicks(): Tick[] {
		return this.ticks;
	}

	setTick(tick: Tick | Tick[]): void {
		if (Array.isArray(tick)) {
			this.ticks = [...this.ticks, ...tick];
			return;
		}

		this.ticks.push(tick);
	}

	getOHLC(): OHLC[] {
		return this.ohlc;
	}

	getLastOHLC(): OHLC {
		return this.ohlc[this.ohlc.length - 1];
	}

	setOHLC(ohlc: OHLC | OHLC[]): void {
		if (Array.isArray(ohlc)) {
			this.ohlc = [...this.ohlc, ...ohlc];
			return;
		}

		this.ohlc.push(ohlc);
	}

	addIndicator(indicator: IIndicator): void {
		this.indicator.addIndicator(indicator);
	}

	getIndicator(name?: string): IIndicator | IIndicator[] {
		return this.indicator.get(name);
	}

	getOrderService(): OrderService {
		return this.orderService;
	}

	getAccountService(): AccountService {
		return this.accountService;
	}
}
