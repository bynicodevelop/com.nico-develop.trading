# Order

Permet la transmission d'ordre sur un ou plusieurs instruments financiers.



## Classe `OrderService`

Est accessible pas le biais de la méthode [getOrderService](./common.md#acces-au-service-de-passage-d-ordre) de la classe [Context](./common.md#context).

## Achat au marché

Permet de prendre un achat au prix marché. Retourne une promesse contenant les informations de l'ordre.

> TODO: Ajouter lien vers la documentation de l'ordre

```ts
try {
    const order = await orderService.buy({
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
    const order = await orderService.sell({
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

## Cloture d'une position par symbole

Permet de clôturer une position par symbole. Retourne une promesse contenant les informations de l'ordre.

Prends en paramètre un modèle de type [Symbol](api/models.md#symbol).

```ts
const order = await orderService.closePosition({
    name: 'BTCUSD',
    exchangeName: 'EXC',
} as Symbol);
```

## Récupérer les positions

Permet de récupérer les positions ouvertes sur le compte de trading.

```ts
orderService.getPositions().then((positions) => {
    console.log(positions);
}).catch((error) => {
    console.log(error);
});
```

Utiliser `await` / `async` peut rendre le code plus lisible, mais peut aussi retarder l'exécution du code en fonction du contexte dans le quel il est utilisé.

```ts
try {
    const positions = await orderService.getPositions();
    console.log(positions);
} catch (error) {
    console.log(error);
}
```