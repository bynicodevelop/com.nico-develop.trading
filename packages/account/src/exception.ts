import { Exception } from '@packages/common';

export class AccountException extends Exception {
	static readonly ACCOUNT_NOT_FOUND_CODE = 'ACCOUNT_NOT_FOUND_CODE';
}
