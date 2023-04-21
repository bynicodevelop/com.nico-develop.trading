import dotenv from 'dotenv';

const { parsed } = dotenv.config();

interface IConfig {
	KEY: string;
	SECRET: string;
}

export const Config: IConfig = {
	KEY: parsed?.KEY || '',
	SECRET: parsed?.SECRET || '',
} as const;
