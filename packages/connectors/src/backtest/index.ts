import { EventEmitter } from 'events';

import { AccountService } from '@packages/account';
import {
	ConnectorEvent,
	Context,
	ExchangeCrypto,
	getSymbolNameList,
	IConnector,
	OHLC,
	roundToMinutes,
	subtractTimeFromDate,
	Symbol,
	Tick,
} from '@packages/common';
import { IConnectorBacktestService } from '@packages/common/src/iconnector-backtest-service';
import { Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

export class BacktestConnector extends EventEmitter implements IConnector {
	private _start: Date;
	private _end: Date;
	private _type: 'bars' | 'quotes' = 'bars';
	private _listOfOHLC: OHLC[] = [];

	private context: Context;

	constructor(
		private service: IConnectorBacktestService,
		options: {
			start: Date;
			end?: Date;
			type?: 'bars' | 'quotes';
		},
		private interval = 1000
	) {
		super();

		this._start = options.start;
		this._end = options.end || subtractTimeFromDate(new Date(), 0, 1, 0, 0);
		this._type = options.type || 'bars';

		const orderService: OrderService = new OrderService(this.service);
		const accountService: AccountService = new AccountService(this.service);
		const indicator: Indicator = new Indicator();

		this.context = new Context(orderService, accountService, indicator);

		const logger = this.context.getLogger();

		logger.log('Initializing backtest connector...');
	}

	private async getHistoricalQuotes(
		start: Date,
		end = new Date()
	): Promise<any[]> {
		let done = false;
		const listOfQuotes: Tick[] = [];

		const logger = this.context.getLogger();

		logger.log('Starting backtest...');

		const stream = this.service.getCryptoQuotes(
			getSymbolNameList(this.context.getSymbols()),
			{
				start: start.toISOString(),
				end: end.toISOString(),
			}
		);

		while (!done) {
			const quote = await stream.next();

			if (quote.done) {
				done = true;
			} else {
				if (
					!listOfQuotes.find(
						(item): boolean =>
							item.timestamp === new Date(quote.value['Timestamp'])
					)
				) {
					const tick = new Tick(
						{
							name: quote.value['Symbol'][0],
							exchangeName: quote.value['Exchange'],
						} as Symbol,
						quote.value['AskPrice'],
						quote.value['AskSize'],
						quote.value['BidPrice'],
						quote.value['BidSize'],
						new Date(quote.value['Timestamp'])
					);

					listOfQuotes.push(tick);

					this.service.updatePrice(tick.askPrice || 0);
					this.service.updateDate(tick.timestamp || null);

					const ohlc = this.aggregateQuotes(tick);

					if (ohlc) {
						this.context.setOHLC(ohlc);
						this.emit(ConnectorEvent.OHLC, this.context);
					}

					this.context.setTick(tick);
					this.emit(ConnectorEvent.Tick, this.context);
				} else {
					const item = listOfQuotes.find(
						(item): boolean =>
							item.timestamp === new Date(quote.value['Timestamp'])
					);

					if (item) {
						item.askPrice = quote.value['AskPrice'];
						item.askSize = quote.value['AskSize'];
						item.bidPrice = quote.value['BidPrice'];
						item.bidSize = quote.value['BidSize'];
					}
				}
			}
		}

		logger.log('Backtest completed.');

		return listOfQuotes;
	}

	/**
	 * Add or update _listOfOHLC with new quote
	 *
	 * @param quote
	 * @returns
	 */
	private aggregateQuotes(quote: Tick): OHLC | null {
		if (
			!this._listOfOHLC.find(
				(item): boolean =>
					roundToMinutes(item.timestamp).getTime() ===
					roundToMinutes(quote.timestamp).getTime()
			)
		) {
			const ohlc = new OHLC(
				quote.symbol,
				quote.askPrice,
				quote.askPrice,
				quote.askPrice,
				quote.askPrice,
				quote.askSize + quote.bidSize,
				quote.timestamp
			);

			this._listOfOHLC.push(ohlc);

			return ohlc;
		} else {
			const item = this._listOfOHLC.find(
				(item): boolean =>
					roundToMinutes(item.timestamp).getTime() ===
					roundToMinutes(quote.timestamp).getTime()
			);

			if (item) {
				item.high = Math.max(item.high, quote.askPrice);
				item.low = Math.min(item.low, quote.askPrice);
				item.close = quote.askPrice;
				item.volume += quote.askSize + quote.bidSize;
			}
		}

		return null;
	}

	private async getHistoricalOHLC(
		start: Date,
		end = new Date(),
		timeframe = '1Min'
	): Promise<OHLC[]> {
		let done = false;
		const listOfOHLC: OHLC[] = [];

		const stream = this.service.getCryptoBars(
			getSymbolNameList(this.context.getSymbols()),
			{
				timeframe,
				start: start.toISOString(),
				end: end.toISOString(),
			}
		);

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
			if (historicalOHLC && historicalOHLC.length > 0) {
				const ohlc = historicalOHLC.shift();

				this.service.updatePrice(ohlc?.open || 0);
				this.service.updateDate(ohlc?.timestamp || null);

				if (ohlc) {
					this.context.setOHLC(ohlc);
					this.emit(ConnectorEvent.OHLC, this.context);
				} else {
					clearInterval(intervalId);
				}
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

		if (this._type === 'bars') {
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
		}

		if (this._type === 'quotes') {
			await this.getHistoricalQuotes(this._start, this._end);
		}
	}
}
