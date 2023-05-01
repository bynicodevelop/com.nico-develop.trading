import { OrderSide, OrderStatus, Position, Symbol } from '@packages/common';

import { Database } from './database';

jest.mock('@packages/database', () => ({
	SQLiteConnector: jest.fn().mockImplementation(() => ({
		init: jest.fn(),
		createTable: jest.fn(),
		exec: jest.fn(),
		all: jest.fn(),
		get: jest.fn(),
	})),
}));

describe('Database', (): void => {
	let database: Database;

	beforeEach(() => {
		database = new Database();

		jest.clearAllMocks();
	});

	it('Doit être défini avec des valeurs par défaut', (): void => {
		database = new Database();

		expect(database).toBeDefined();
		expect(database['_path']).toBe('./db/db.sqlite');
		expect(database['databaseService']).toBeDefined();
	});

	it('Doit être défini avec une valeur de path', (): void => {
		database = new Database('./database/database.sqlite');

		expect(database).toBeDefined();
		expect(database['_path']).toBe('./database/database.sqlite');
	});

	it('Doit permet la creation de la table positions', async (): Promise<void> => {
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

	it("Doit retourner une erreur si l'id n'est pas défini", async (): Promise<void> => {
		await expect(database.getPosition('')).rejects.toThrowError(
			'Id is not defined'
		);
	});

	it('Doit retourner une position par son id', async (): Promise<void> => {
		const data = {
			id: 'id',
			symbolName: 'symbolName',
			symbolExchange: 'symbolExchange',
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: new Date(),
			closeDate: new Date(),
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
			pl: 1,
		};

		const sql = `"SELECT * FROM positions WHERE id = 'id'"`.replace(
			/\s+/g,
			' '
		);

		database['databaseService'].get = jest.fn().mockResolvedValue(data);

		const result = await database.getPosition('id');

		expect(
			(database['databaseService'].get as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);

		expect(result).toEqual({
			id: 'id',
			symbol: {
				name: data.symbolName,
				exchangeName: data.symbolExchange,
			} as unknown as Symbol,
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: data.openDate,
			closeDate: data.closeDate,
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
			pl: 1,
		});
	});

	it('Doit retourner une position par son id', async (): Promise<void> => {
		const data = {
			id: 'id',
			symbolName: 'symbolName',
			symbolExchange: 'symbolExchange',
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: new Date(),
			closeDate: new Date(),
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
		};

		const sql = `"SELECT * FROM positions WHERE id = 'id'"`.replace(
			/\s+/g,
			' '
		);

		database['databaseService'].get = jest.fn().mockResolvedValue(data);

		const result = await database.getPosition('id');

		expect(
			(database['databaseService'].get as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);

		expect(result).toEqual({
			id: 'id',
			symbol: {
				name: data.symbolName,
				exchangeName: data.symbolExchange,
			} as unknown as Symbol,
			side: OrderSide.Buy,
			status: OrderStatus.Open,
			openDate: data.openDate,
			closeDate: data.closeDate,
			openPrice: 1,
			closePrice: 1,
			quantity: 1,
			pl: 0,
		});
	});

	it('Doit retourner une liste de positions vide', async (): Promise<void> => {
		const sql = `" SELECT * FROM positions "`.replace(/\s+/g, ' ');

		database['databaseService'].all = jest.fn().mockResolvedValue([]);

		const result = await database.getPositions();

		expect(
			(database['databaseService'].all as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);

		expect(result).toEqual([]);
	});

	it('Doit retourner une liste de positions', async (): Promise<void> => {
		const data = [
			{
				id: 'id',
				symbolName: 'symbolName',
				symbolExchange: 'symbolExchange',
				side: OrderSide.Buy,
				status: OrderStatus.Open,
				openDate: new Date(),
				closeDate: new Date(),
				openPrice: 1,
				closePrice: 1,
				quantity: 1,
				pl: 1,
			},
		];

		const sql = `" SELECT * FROM positions "`.replace(/\s+/g, ' ');

		database['databaseService'].all = jest.fn().mockResolvedValue(data);

		const result = await database.getPositions();

		expect(
			(database['databaseService'].all as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);

		expect(result).toEqual([
			{
				id: 'id',
				symbol: {
					name: data[0].symbolName,
					exchangeName: data[0].symbolExchange,
				} as unknown as Symbol,
				side: OrderSide.Buy,
				status: OrderStatus.Open,
				openDate: data[0].openDate,
				closeDate: data[0].closeDate,
				openPrice: 1,
				closePrice: 1,
				quantity: 1,
				pl: 1,
			},
		]);
	});

	it('Doit retourner une liste de positions avec un pl non existant', async (): Promise<void> => {
		const data = [
			{
				id: 'id',
				symbolName: 'symbolName',
				symbolExchange: 'symbolExchange',
				side: OrderSide.Buy,
				status: OrderStatus.Open,
				openDate: new Date(),
				closeDate: new Date(),
				openPrice: 1,
				closePrice: 1,
				quantity: 1,
			},
		];

		const sql = `" SELECT * FROM positions "`.replace(/\s+/g, ' ');

		database['databaseService'].all = jest.fn().mockResolvedValue(data);

		const result = await database.getPositions();

		expect(
			(database['databaseService'].all as jest.Mock).mock.calls[0][0].replace(
				/\s+/g,
				' '
			)
		).toMatchInlineSnapshot(sql);

		expect(result).toEqual([
			{
				id: 'id',
				symbol: {
					name: data[0].symbolName,
					exchangeName: data[0].symbolExchange,
				} as unknown as Symbol,
				side: OrderSide.Buy,
				status: OrderStatus.Open,
				openDate: data[0].openDate,
				closeDate: data[0].closeDate,
				openPrice: 1,
				closePrice: 1,
				quantity: 1,
				pl: 0,
			},
		]);
	});

	it("Doit générer une erreur s'il n'y a pas d'id", async (): Promise<void> => {
		const position = {
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

		await expect(database.createPosition(position)).rejects.toThrow(
			'Position id is required'
		);
	});

	it("Doit permet la creation d'une positions", async (): Promise<void> => {
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

	it('Doit permet de clôturer une positions', async (): Promise<void> => {
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
