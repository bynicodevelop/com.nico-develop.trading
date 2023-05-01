import { Account, IConnectorService } from '@packages/common';

import { AccountService } from './account';

describe('AccountService', () => {
	let accountService: AccountService;
	let connectorServiceMock: jest.Mocked<IConnectorService>;
	let accountMock: Account;

	beforeEach(() => {
		accountMock = {
			id: 'my-account-id',
			balance: 1000,
			equity: 500,
		} as Account;

		connectorServiceMock = {
			getAccount: jest.fn().mockResolvedValue(accountMock),
		} as unknown as jest.Mocked<IConnectorService>;

		accountService = new AccountService(connectorServiceMock);
	});

	describe('getAccount', () => {
		it('should return an Account object', async () => {
			const account = await accountService.getAccount();

			expect(account).toEqual(accountMock);
			expect(connectorServiceMock.getAccount).toHaveBeenCalledTimes(1);
		});

		it('should throw an error if there is an error getting the account', async () => {
			const errorMessage = 'An error occurred while getting the account';
			connectorServiceMock.getAccount.mockRejectedValueOnce(
				new Error(errorMessage)
			);

			await expect(accountService.getAccount()).rejects.toThrowError(
				errorMessage
			);
			expect(connectorServiceMock.getAccount).toHaveBeenCalledTimes(1);
		});
	});

	describe('equity', () => {
		it('Doit retourner le solde du compte', async () => {
			const equity = await accountService.equity();

			expect(equity).toEqual(accountMock.equity);
			expect(connectorServiceMock.getAccount).toHaveBeenCalledTimes(1);
		});
	});

	describe('pl', () => {
		it('Doit retourner le solde du compte', async () => {
			const pl = await accountService.pl();

			expect(pl).toEqual(accountMock.balance - accountMock.equity);
			expect(connectorServiceMock.getAccount).toHaveBeenCalledTimes(1);
		});
	});
});
