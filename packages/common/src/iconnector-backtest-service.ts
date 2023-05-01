import { IConnectorService } from './iconnector-service';

export interface IConnectorBacktestService extends IConnectorService {
	updatePrice(price: number): void;

	updateDate(date: Date | null): void;
}
