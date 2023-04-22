import { EventEmitter } from 'events';

import {
	CryptoBar,
	CryptoQuote,
} from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import {
	ConnectorEvent,
	Context,
	IConnector,
	OHLC,
	subtractTimeFromDate,
	Symbol,
	Tick,
} from '@packages/common';
import { ExchangeCrypto } from '@packages/common/src/enums/exchanges-crypto';

import { AlpacaService } from './service';

export * from './service';

export class AlpacaConnector extends EventEmitter implements IConnector {
	private context = new Context();

	constructor(private service: AlpacaService) {
		super();
	}

	private cryptoQuoteToTick(quote: CryptoQuote): Tick | null {
		if (!this.isCurrentSymbol(quote.Exchange)) return null;

		return new Tick(
			{
				name: quote.Symbol,
				exchangeName: quote.Exchange as ExchangeCrypto,
			} as Symbol,
			quote.AskPrice,
			quote.AskSize,
			quote.BidPrice,
			quote.BidSize,
			new Date(Date.parse(quote.Timestamp))
		);
	}

	private cryptoBarToOHLC(bar: CryptoBar): OHLC | null {
		// if (!this.isCurrentSymbol(bar.Exchange)) return null;

		return new OHLC(
			{
				name: bar.Symbol,
				exchangeName: bar.Exchange as ExchangeCrypto,
			} as Symbol,
			bar.Open,
			bar.High,
			bar.Low,
			bar.Close,
			bar.Volume,
			new Date(Date.parse(bar.Timestamp))
		);
	}

	private getSymbolNameList(): string[] {
		return this.context.getSymbols().map((symbol): string => symbol.name);
	}

	private async getHistoricalOHLC(
		start: Date,
		end = new Date(),
		timeframe = '1Min'
	): Promise<OHLC[]> {
		let done = false;
		const listOfOHLC: OHLC[] = [];

		const stream = this.service.getCryptoBars(this.getSymbolNameList(), {
			timeframe,
			start: start.toISOString(),
			end: end.toISOString(),
		});

		while (!done) {
			const bar = await stream.next();

			if (bar.done) {
				done = true;
			} else {
				const ohlc = new OHLC(
					{
						name: bar.value['Symbol'],
						exchangeName: bar.value['Exchange'] as ExchangeCrypto,
					},
					bar.value['Open'],
					bar.value['High'],
					bar.value['Low'],
					bar.value['Close'],
					bar.value['Volume'],
					new Date(bar.value['Timestamp'])
				);

				if (
					!listOfOHLC.find(
						(item): boolean =>
							item.timestamp.getTime() === ohlc.timestamp.getTime()
					)
				) {
					listOfOHLC.push(ohlc);
				} else {
					const item = listOfOHLC.find(
						(item): boolean =>
							item.timestamp.getTime() === ohlc.timestamp.getTime()
					);

					if (item) {
						item.volume += ohlc.volume;
						item.close = ohlc.close;
					}
				}
			}
		}

		return listOfOHLC;
	}

	private isCurrentSymbol(exchangeName: string): boolean {
		return !!this.context
			.getSymbols()
			.find((symbol): boolean => symbol.exchangeName === exchangeName);
	}

	async run(): Promise<void> {
		await new Promise<void>((resolve): void => {
			this.service.onConnect((): void => {
				console.log('AlpacaConnector: connected');

				this.emit(ConnectorEvent.Authenticated, this.context);

				resolve();
			});

			this.service.connect();
		});

		if (this.context.getSymbols().length === 0) {
			console.error('AlpacaConnector: no symbol found');
			return;
		}

		const date = new Date();

		const historicalOHLC = await this.getHistoricalOHLC(
			subtractTimeFromDate(date, 0, 20, 0, 0),
			subtractTimeFromDate(date, 0, 1, 0, 0),
			'1Min'
		);

		this.context.setOHLC(historicalOHLC);

		this.emit(ConnectorEvent.HistoricalOHLC, this.context);

		this.service.subscribeForQuotes(this.getSymbolNameList());

		this.service.subscribeForBars(this.getSymbolNameList());

		this.service.onError((error): void => {
			console.error('AlpacaConnector: error', error);
		});

		this.service.onCryptoQuote((quote): void => {
			const tick = this.cryptoQuoteToTick(quote);

			if (!tick) return;

			this.context.setTick(tick);
			this.emit(ConnectorEvent.Tick, this.context);
		});

		this.service.onCryptoBar((bar: CryptoBar): void => {
			const ohlc = this.cryptoBarToOHLC(bar);

			if (!ohlc) return;

			this.context.setOHLC(ohlc);
			this.emit(ConnectorEvent.OHLC, this.context);
		});
	}
}
