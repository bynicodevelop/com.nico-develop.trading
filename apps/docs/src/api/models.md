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

## Order

Modèle de données représentant un ordre.

```ts
export interface IOrder extends IModel {
	id: string;
	symbol: Symbol;
	quantity: number;
	side: OrderSide;
	pl: number;
}

export class Order implements IOrder { ...}
```

* `id` : Identifiant de l'ordre.
* `symbol` : [Symbol](./models.md#symbol) de l'ordre.
* `quantity` : Quantité de l'ordre.
* `side` : Sens de l'ordre.
* `pl` : Profit/Loss de l'ordre.