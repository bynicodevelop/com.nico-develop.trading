import { OrderSide } from '../enums/order';
import { IModel } from './imodel';
import { Symbol } from './symbol';

export class Order implements IModel {
	private _id?: string;
	private _symbol: Symbol;
	private _quantity: number;
	private _side: OrderSide;

	get id(): string {
		return this._id ?? '';
	}

	set id(id: string) {
		this._id = id;
	}

	get symbol(): Symbol {
		return this._symbol;
	}

	set symbol(symbol: Symbol) {
		this._symbol = symbol;
	}

	get quantity(): number {
		return this._quantity;
	}

	set quantity(quantity: number) {
		this._quantity = quantity;
	}

	get side(): OrderSide {
		return this._side;
	}

	set side(side: OrderSide) {
		this._side = side;
	}

	constructor(symbol: Symbol, quantity: number, side: OrderSide) {
		this._symbol = symbol;
		this._quantity = quantity;
		this._side = side;
	}

	toJson(): Record<string, unknown> {
		return {};
	}
}
