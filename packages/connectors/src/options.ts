interface IDatabaseOption {
	DATABASE_PATH: string;
}

interface IOption {
	KEY: string;
	SECRET: string;
}

export type ConnectorOption = IOption & Partial<IDatabaseOption>;
