import { Exception } from '@packages/common';

export class OrderException extends Exception {
	static readonly ORDER_REJECTED_CODE = 'ORDER_REJECTED_CODE';
	static readonly POSITION_NOT_FOUND_CODE = 'POSITION_NOT_FOUND_CODE';
}
