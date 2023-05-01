# Common


## Context

La classe `Context` permet de transmettre différents informations dans le cadre de la stratégie de trading.

Chaque méthode de la [stratégie](./strategy.md) possède une propriété `context` qui permet d'accéder à cette classe.

### Accès au logger

Pour accéder au logger, il suffit d'utiliser la méthode `getLogger` de la classe `Context`.

```ts
const logger = context.getLogger();
```

Puis vous pouvez utiliser les méthodes `info`, `warn`, `error` et `debug` pour écrire dans les logs.

```ts
logger.info('Hello world');
```

Cela va générer un dossier `logs` dans le répertoire de votre stratégie.


### Récupérer le service de compte

Pour récupérer le service de compte, il suffit d'utiliser la méthode `getAccountService` de la classe `Context`.

```ts
const accountService = context.getAccountService();
```

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