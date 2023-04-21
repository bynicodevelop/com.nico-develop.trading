import { Context } from './services/context';

export interface IConnector {
	on(event: string, listener: (context: Context) => void): void;

	run(): void;
}
