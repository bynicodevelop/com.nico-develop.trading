import { Account, IConnectorService } from '@packages/common';

export class AccountService {
	constructor(private connectorService: IConnectorService) {}

	getAccount(): Promise<Account> {
		return this.connectorService.getAccount();
	}

	async equity(): Promise<number> {
		const account = await this.getAccount();

		return account.equity;
	}

	async pl(): Promise<number> {
		const account = await this.getAccount();

		return account.balance - account.equity;
	}
}
