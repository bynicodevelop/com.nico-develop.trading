# Modèles de données

## Symbol

Modèle de données représentant un produit financier.

```ts
interface ISymbol {
	name: string;
	exchangeName: ExchangeCrypto;
}

export type Symbol = ISymbol;
```

* `name` : Nom du symbole.
* `exchangeName` : Nom de l'échange (fournisseur de données).

## Position

Modèle de données représentant un ordre.

```ts
export interface IPosition extends IModel {
	id: string;
	symbol: Symbol;
	quantity: number;
	side: OrderSide;
	pl: number;
}

export class Position implements IPosition { ...}
```

* `id` : Identifiant de l'ordre.
* `symbol` : [Symbol](./models.md#symbol) de l'ordre.
* `quantity` : Quantité de l'ordre.
* `side` : Sens de l'ordre.
* `pl` : Profit/Loss de l'ordre.

## Order

Modèle de données représentant un ordre.

```ts
export interface IOrder extends IModel {
	id: string;
	symbol: Symbol;
	quantity: number;
	side: string;
	price: number;
}

export class Order implements IOrder { ... }
```

* `id` : Identifiant de l'ordre.
* `symbol` : [Symbol](./models.md#symbol) de l'ordre.
* `quantity` : Quantité de l'ordre.
* `side` : Sens de l'ordre.
* `price` : Prix de l'ordre.

## OHLC

Modèle de données représentant un OHLC (chandelier).

```ts
interface IOHLC {
	symbol: Symbol;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	timestamp: Date;
}

export enum CandleType {
	Up = 'up',
	Down = 'down',
	Doji = 'doji',
}

export class OHLC implements IOHLC, IModel {
	// Implement IOHLC and IModel

	candleType(): string {
		if (this.open < this.close) {
			return CandleType.Up;
		} else if (this.open > this.close) {
			return CandleType.Down;
		} else {
			return CandleType.Doji;
		}
	}

	isCandleUp(): boolean {
		return this.candleType() === CandleType.Up;
	}

	isCandleDown(): boolean {
		return this.candleType() === CandleType.Down;
	}

	isCandleDoji(): boolean {
		return this.candleType() === CandleType.Doji;
	}
}
