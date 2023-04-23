export interface IAccount {
	id: string;
	currency: string;
	cash: number;
	equity: number;
}

export type Account = IAccount;
