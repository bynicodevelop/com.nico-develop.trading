import {
	Account,
	IConnectorService,
} from '@packages/common';

export class AccountService {
	constructor(private connectorService: IConnectorService) {}

	getAccount(): Promise<Account> {
		return this.connectorService.getAccount();
	}
}
