import { IModel } from './imodel';
import { Symbol } from './symbol';

export interface IOrder extends IModel {}

export class Order implements IOrder {
	private _id: string;
	private _symbol: Symbol;
	private _quantity: number;
	private _side: string;
	private _price: number;

	public get id(): string {
		return this._id;
	}

	public set id(id: string) {
		this._id = id;
	}

	public get symbol(): Symbol {
		return this._symbol;
	}

	public set symbol(symbol: Symbol) {
		this._symbol = symbol;
	}

	public get quantity(): number {
		return this._quantity;
	}

	public set quantity(quantity: number) {
		this._quantity = quantity;
	}

	public get side(): string {
		return this._side;
	}

	public set side(side: string) {
		this._side = side;
	}

	public get price(): number {
		return this._price;
	}

	public set price(price: number) {
		this._price = price;
	}

	constructor(
		id: string,
		symbol: Symbol,
		quantity: number,
		side: string,
		price: number
	) {
		this._id = id;
		this._symbol = symbol;
		this._quantity = quantity;
		this._side = side;
		this._price = price;
	}

	toJson(): Record<string, unknown> {
		return {
			id: this._id,
			symbol: this._symbol,
			quantity: this._quantity,
			side: this._side,
			price: this._price,
		};
	}
}
