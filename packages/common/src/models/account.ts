export interface IAccount {
	id: string;
	currency: string;
	balance: number;
	equity: number;
	pl: number;
}

export type Account = IAccount;
