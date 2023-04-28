import {
	OrderSide,
	OrderStatus,
	Position,
	Symbol,
} from '@packages/common';

import { Database } from './database';

jest.mock('@packages/database', () => ({
	SQLiteConnector: jest.fn().mockImplementation(() => ({
		init: jest.fn(),
		createTable: jest.fn(),
		exec: jest.fn(),
	})),
}));

describe('Database', () => {
	let database: Database;

	beforeEach(() => {
		database = new Database();

		jest.clearAllMocks();
	});

	it('Doit être défini avec des valeurs par defaut', () => {
		database = new Database();

		expect(database).toBeDefined();
		expect(database['_path']).toBe('./db/db.sqlite');
		expect(database['databaseService']).toBeDefined();
	});

	it('Doit être défini avec une valeur de path', () => {
		database = new Database('./database/database.sqlite');

		expect(database).toBeDefined();
		expect(database['_path']).toBe('./database/database.sqlite');
	});

	it('Doit permet la creation de la table positions', async () => {
		const sql = `"CREATE TABLE IF NOT EXISTS positions (
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
        )"`.replace(/\s+/g, ' ');

		await database.init();

		expect(
			(
				database['databaseService'].createTable as jest.Mock
			).mock.calls[0][0].replace(/\s+/g, ' ')
		).toMatchInlineSnapshot(sql);
	});

	it("Doit permet la creation d'une positions", async () => {
		const position = {
			id: 'id',
			symbol: {
				name: 'name',
				exchangeName: 'exchangeName',
			} as unknown as Symbol,
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: new Date(),
			closeDate: new Date(),
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
			pl: 1,
		} as Position;

		const sql = `"INSERT INTO positions (
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
            )"`.replace(/\s+/g, ' ');

		await database.createPosition(position);

		expect(
			(database['databaseService'].exec as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);
	});

	it('Doit permet de clôturer une positions', async () => {
		const position = {
			id: 'id',
			symbol: {
				name: 'name',
				exchangeName: 'exchangeName',
			} as unknown as Symbol,
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: new Date(),
			closeDate: new Date(),
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
			pl: 1,
		} as Position;

		const spl = `"UPDATE positions SET
            status = '${position.status}',
            closeDate = '${position.closeDate}',
            closePrice = ${position.closePrice},
            pl = ${position.pl}
        WHERE id = '${position.id}'"`.replace(/\s+/g, ' ');

		await database.closePosition(position);

		expect(
			(database['databaseService'].exec as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(spl);
	});
});
