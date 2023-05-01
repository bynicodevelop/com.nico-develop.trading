# Strategy

La stratégie est le coeur de votre robot. C'est elle qui va définir les règles de trading et les actions à effectuer.

La stratégie est une interface à implémenter dans votre code. 

```ts
interface IStrategy {
	init(context: Context): void;
	run(context: Context): void;
	onTick(context: Context): void;
	onBar(context: Context): void;
}

export type StrategyBase = IStrategy;
```

Chaque méthode prend en paramètre un objet `context` qui permet d'accéder à différentes informations.

> :information_source: En savoir plus sur la classe [Context](./common.md#context)

## Méthodes

### init

La méthode `init` est appelée au démarrage de la stratégie. Elle permet d'initialiser les variables de la stratégie.

```ts
init(context: Context): void;
```

### run

La méthode `run` est appelée à chaque événement. Elle permet de définir les règles de trading.

```ts
run(context: Context): void;
```

### onTick

La méthode `onTick` est appelée à chaque tick (mouvement sur le marché). Elle permet de définir les règles de trading.

```ts
onTick(context: Context): void;
```

### onBar

La méthode `onBar` est appelée à chaque bar (candlestick). Elle permet de définir les règles de trading.

```ts
onBar(context: Context): void;
```

## Exemple

```ts
import { StrategyBase, Context } from '@packages/common';

export class MyStrategy implements StrategyBase {
    init(context: Context): void {
        // Initialisation de la stratégie
    }

    run(context: Context): void {
        // Définition des règles de trading
    }

    onTick(context: Context): void {
        // Définition des règles de trading
    }

    onBar(context: Context): void {
        // Définition des règles de trading
    }
}
```