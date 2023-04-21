import {
	ConnectorEvent,
	Context,
	IConnector,
} from '@packages/common';
import { StrategyBase } from '@packages/strategy';

export class Connector implements Partial<IConnector> {
	constructor(private strategy: StrategyBase, private connector: IConnector) {}

	async run(): Promise<void> {
		this.connector.on(
			ConnectorEvent.Authenticated,
			(context: Context): void => {
				this.strategy.init(context);
			}
		);

		this.connector.on(ConnectorEvent.Tick, (context: Context): void => {
			this.strategy.run(context);
			this.strategy.onTick(context);
		});

		this.connector.on(ConnectorEvent.OHLC, (context: Context): void => {
			this.strategy.run(context);
			this.strategy.onBar(context);
		});

		this.connector.run();
	}
}
