import { Exception } from '@packages/common';

export class OrderException extends Exception {
	static readonly ORDER_REJECTED_CODE = 'ORDER_REJECTED_CODE';
}
