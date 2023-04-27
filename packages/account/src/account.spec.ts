import { Account, IConnectorService } from '@packages/common';

import { AccountService } from './account';

describe('AccountService', () => {
	let accountService: AccountService;
	let connectorServiceMock: jest.Mocked<IConnectorService>;

	beforeEach(() => {
		connectorServiceMock = {
			getAccount: jest.fn(),
		} as unknown as jest.Mocked<IConnectorService>;

		accountService = new AccountService(connectorServiceMock);
	});

	describe('getAccount', () => {
		it('should return an Account object', async () => {
			const expectedAccount: Account = {
				id: 'my-account-id',
				balance: 1000,
			} as Account;

			connectorServiceMock.getAccount.mockResolvedValueOnce(expectedAccount);

			const account = await accountService.getAccount();

			expect(account).toEqual(expectedAccount);
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
});
