# Common


## Context

La classe `Context` permet de transmettre différents informations dans le cadre de la stratégie de trading.


### Accès au service de passage d'ordre

Pour accéder au service de passage d'ordre, il suffit d'utiliser la méthode `getOrderService` de la classe `Context`.

```ts
const orderService = context.getOrderService();
```

Cette méthode retourne une instance de la classe [OrderService](./order.md#classe-orderservice) qui permet de donner accès au méthodes de passage d'ordre (buy, sell...). 

### Récupérer les symboles

Pour récupérer les symboles, il suffit d'utiliser la méthode `getSymbols` de la classe `Context`. Retourne une liste du modèle [Symbol](api/models.md#symbol).

```ts
const symbols = context.getSymbols();
```