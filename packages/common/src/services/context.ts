import { Indicator } from '../../../indicators';
import { IIndicator } from '../../../indicators/src/iindicator';
import { OHLC } from '../models/ohlc';
import { Symbol } from '../models/symbol';
import { Tick } from '../models/tick';

export class Context {
	private symbols: Symbol[] = [];
	private ticks: Tick[] = [];
	private ohlc: OHLC[] = [];
	private indicator: Indicator = new Indicator();

	public getSymbols(): Symbol[] {
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
}
