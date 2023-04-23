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