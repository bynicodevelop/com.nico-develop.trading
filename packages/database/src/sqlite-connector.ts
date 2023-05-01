import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { Database, open } from 'sqlite';
import sqlite3, { Statement } from 'sqlite3';

export class SQLiteConnector {
	private db!: Database<sqlite3.Database, Statement>;

	private initDatabase(dbPath: string): void {
		const _dirname = dirname(dbPath);

		if (!existsSync(_dirname)) {
			mkdirSync(_dirname, { recursive: true });
		}

		if (!existsSync(dbPath)) {
			writeFileSync(dbPath, '');
		}
	}

	async init(path: string): Promise<void> {
		this.initDatabase(path);

		this.db = await open<sqlite3.Database, Statement>({
			filename: path,
			driver: sqlite3.Database,
		});
	}

	async all(request: string): Promise<any[]> {
		return await this.db.all(request);
	}

	async get(request: string): Promise<any> {
		return await this.db.get(request);
	}

	async exec(request: string): Promise<void> {
		await this.db.run(request);
	}

	async createTable(request: string): Promise<void> {
		await this.db.exec(request);
	}
}
