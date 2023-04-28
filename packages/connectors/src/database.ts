import {
	OrderSide,
	OrderStatus,
	Position,
} from '@packages/common';
import { SQLiteConnector } from '@packages/database';

export class Database {
	private _path: string;

	private databaseService: SQLiteConnector;

	constructor(path?: string) {
		this._path = path ?? './db/db.sqlite';
		this.databaseService = new SQLiteConnector();
	}

	async init(): Promise<void> {
		await this.databaseService.init(this._path ?? './db/db.sqlite');

		await this.databaseService
			.createTable(`CREATE TABLE IF NOT EXISTS positions (
                id TEXT PRIMARY KEY,
                symbolName TEXT NOT NULL,
                symbolExchange TEXT NOT NULL,
                status TEXT NOT NULL,
                side TEXT NOT NULL,
                openDate DATE NOT NULL,
                closeDate DATE,
                openPrice REAL NOT NULL,
                closePrice REAL,
                quantity REAL NOT NULL,
                pl REAL
            )`);
	}

	async getPositions(): Promise<Position[]> {
		const result = await this.databaseService.all(`
            SELECT * FROM positions
        `);

		return result.map(
			(row): Position =>
				({
					id: row.id,
					symbol: {
						name: row.symbolName,
						exchangeName: row.symbolExchange,
					},
					side: row.side as OrderSide,
					status: row.status as OrderStatus,
					openDate: row.openDate,
					closeDate: row.closeDate,
					openPrice: row.openPrice,
					closePrice: row.closePrice,
					quantity: row.quantity,
					pl: row.pl ?? 0,
				} as Position)
		);
	}

	async createPosition(position: Position): Promise<Position> {
		if (!position.id) {
			throw new Error('Position id is required');
		}

		await this.databaseService.exec(`INSERT INTO positions (
                id,
                symbolName,
                symbolExchange,
                side,
                status,
                openDate,
                closeDate,
                openPrice,
                closePrice,
                quantity,
                pl
            ) VALUES (
                '${position.id}',
                '${position.symbol.name}',
                '${position.symbol.exchangeName}',
                '${position.side}',
                '${position.status}',
                '${position.openDate}',
                '${position.closeDate}',
                ${position.openPrice},
                ${position.closePrice},
                ${position.quantity},
                ${position.pl}
            )`);

		return position;
	}

	async closePosition(position: Position): Promise<Position> {
		await this.databaseService.exec(`UPDATE positions SET
                status = '${position.status}',
                closeDate = '${position.closeDate}',
                closePrice = ${position.closePrice},
                pl = ${position.pl}
            WHERE id = '${position.id}'`);

		return position;
	}
}
