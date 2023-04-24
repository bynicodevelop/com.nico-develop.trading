import { EventEmitter } from 'events';

import { AccountService } from '@packages/account';
import {
	ConnectorEvent,
	Context,
	ExchangeCrypto,
	IConnector,
	IConnectorService,
	OHLC,
	subtractTimeFromDate,
} from '@packages/common';
import { Indicator } from '@packages/indicators';
import { OrderService } from '@packages/orders';

export class BacktestConnector extends EventEmitter implements IConnector {
	private context: Context;

	constructor(private service: IConnectorService, private interval = 1000) {
		super();

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

	async run(): Promise<void> {
		const logger = this.context.getLogger();

		this.emit(ConnectorEvent.Authenticated, this.context);

		if (this.context.getSymbols().length === 0) {
			console.error('AlpacaConnector: no symbol found');
			return;
		}

		logger.log('Loading historical OHLC...');

		const date = new Date();

		const historicalOHLC = await this.getHistoricalOHLC(
			subtractTimeFromDate(date, 0, 0, 0, 3),
			subtractTimeFromDate(date, 0, 1, 0, 0),
			'1Min'
		);

		logger.log('Historical OHLC loaded');

		const intervalId = setInterval(() => {
			const ohlc = historicalOHLC.shift();

			if (ohlc) {
				this.context.setOHLC(ohlc);
				this.emit(ConnectorEvent.OHLC, this.context);
			} else {
				clearInterval(intervalId);
			}
		}, this.interval);

		return Promise.resolve();
	}
}
