import { EventEmitter } from 'events';

import { AccountService } from '@packages/account';
import {
	ConnectorEvent,
	Context,
	ExchangeCrypto,
	IConnector,
	OHLC,
	subtractTimeFromDate,
} from '@packages/common';
import { IConnectorBacktestService } from '@packages/common/src/iconnector-backtest-service';
import { Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

export class BacktestConnector extends EventEmitter implements IConnector {
	private _start: Date;
	private _end: Date;

	private context: Context;

	constructor(
		private service: IConnectorBacktestService,
		options: {
			start: Date;
			end?: Date;
		},
		private interval = 1000
	) {
		super();

		this._start = options.start;
		this._end = options.end || subtractTimeFromDate(new Date(), 0, 1, 0, 0);

		const orderService: OrderService = new OrderService(this.service);
		const accountService: AccountService = new AccountService(this.service);
		const indicator: Indicator = new Indicator();

		this.context = new Context(orderService, accountService, indicator);

		const logger = this.context.getLogger();

		logger.log('Initializing backtest connector...');
	}

	private getSymbolNameList(): string[] {
		return this.context.getSymbols().map((symbol): string => symbol.name);
	}

	private async getHistoricalQuotes(
		start: Date,
		end = new Date()
	): Promise<any[]> {
		let done = false;
		const listOfQuotes: any[] = [];

		const stream = this.service.getCryptoQuotes(this.getSymbolNameList(), {
			start: start.toISOString(),
			end: end.toISOString(),
		});

		while (!done) {
			const quote = await stream.next();

			if (quote.done) {
				done = true;
			} else {
				if (
					!listOfQuotes.find(
						(item): boolean => item.Timestamp === quote.value['Timestamp']
					)
				) {
					listOfQuotes.push(quote.value);
				} else {
					const item = listOfQuotes.find(
						(item): boolean => item.Timestamp === quote.value['Timestamp']
					);

					if (item) {
						item.volume += quote.value['volume'];
						item.close = quote.value['last'];
					}
				}
			}
		}

		return listOfQuotes;
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
						name: bar.value['Symbol'][0],
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

	private playStrategy(historicalOHLC: OHLC[]): void {
		const intervalId = setInterval((): void => {
			const ohlc = historicalOHLC.shift();

			this.service.updatePrice(ohlc?.open || 0);
			this.service.updateDate(ohlc?.timestamp || null);

			if (ohlc) {
				this.context.setOHLC(ohlc);
				this.emit(ConnectorEvent.OHLC, this.context);
			} else {
				clearInterval(intervalId);
			}
		}, this.interval);
	}

	async run(): Promise<void> {
		const logger = this.context.getLogger();

		this.emit(ConnectorEvent.Authenticated, this.context);

		if (this.context.getSymbols().length === 0) {
			console.error('AlpacaConnector: no symbol found');
			return;
		}

		logger.log('Loading historical OHLC...');

		const historicalOHLC = await this.getHistoricalOHLC(
			this._start,
			this._end,
			'1Min'
		);

		logger.log('Historical OHLC loaded');

		if (historicalOHLC?.length === 0) {
			logger.log('No historical OHLC found');
			return;
		}

		this.playStrategy(historicalOHLC);

		return Promise.resolve();
	}
}
