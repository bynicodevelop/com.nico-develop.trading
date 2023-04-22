# Order

Permet la transmission d'ordre sur un ou plusieurs instruments financiers.



## Classe `OrderService`

Est accessible pas le biais de la méthode [getOrderService](./common.md#acces-au-service-de-passage-d-ordre) de la classe [Context](./common.md#context).

## Achat au marché

Permet de prendre un achat au prix marché. Retourne une promesse contenant les informations de l'ordre.

> TODO: Ajouter lien vers la documentation de l'ordre

```ts
try {
    const order await orderService.buy({
        name: 'BTCUSD',
        exchangeName: 'EXC',
    }, 0.1);
} catch (error: any) {
	if (error instanceof Exception) {
	    console.log(error.code);
	}

	console.log(error.message);
}
```

## Vente au marché

Permet de prendre une vente au prix marché. Retourne une promesse contenant les informations de l'ordre.

> TODO: Ajouter lien vers la documentation de l'ordre

```ts
try {
    const order await orderService.sell({
        name: 'BTCUSD',
        exchangeName: 'EXC',
    }, 0.1);
} catch (error: any) {
	if (error instanceof Exception) {
	    console.log(error.code);
	}

	console.log(error.message);
}
```