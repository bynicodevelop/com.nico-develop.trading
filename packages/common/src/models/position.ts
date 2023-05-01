import { OrderSide, OrderStatus } from '../enums/order';
import { IModel } from './imodel';
import { Symbol } from './symbol';

export interface IPosition extends IModel {
	id: string;
	symbol: Symbol;
	quantity: number;
	side: OrderSide;
	status: 'open' | 'closed';
	pl: number;
	openPrice: number;
	closePrice: number;
	openDate: Date | null;
	closeDate: Date | null;
}

export class Position implements IPosition {
	private _id?: string;
	private _symbol: Symbol;
	private _quantity: number;
	private _side: OrderSide;
	private _status: OrderStatus;
	private _pl?: number;
	private _openPrice: number;
	private _closePrice: number;
	private _openDate: Date | null;
	private _closeDate: Date | null;

	public get openPrice(): number {
		return this._openPrice;
	}

	public set openPrice(openPrice: number) {
		this._openPrice = openPrice;
	}

	public get closePrice(): number {
		return this._closePrice;
	}

	public set closePrice(closePrice: number) {
		this._closePrice = closePrice;
	}

	public get openDate(): Date | null {
		return this._openDate;
	}

	public set openDate(openDate: Date | null) {
		this._openDate = openDate;
	}

	public get closeDate(): Date | null {
		return this._closeDate;
	}

	public set closeDate(closeDate: Date | null) {
		this._closeDate = closeDate;
	}

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

	get status(): OrderStatus {
		return this._status;
	}

	set status(status: OrderStatus) {
		this._status = status;
	}

	get pl(): number {
		return this._pl ?? 0;
	}

	set pl(pl: number) {
		this._pl = pl;
	}

	constructor(id: string, symbol: Symbol, quantity: number, side: OrderSide) {
		this._id = id;
		this._symbol = symbol;
		this._quantity = quantity;
		this._side = side;

		this._openPrice = 0;
		this._closePrice = 0;

		this._openDate = null;
		this._closeDate = null;

		this._status = OrderStatus.Open;
		this._pl = 0;
	}

	toJson(): Record<string, unknown> {
		return {};
	}
}
