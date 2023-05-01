# Stratégies Méthodes

Chaque méthode prend en paramètre un objet `Context` qui contient les informations de la stratégie, les divers indicateurs techniques et autres données de trading.

## init

La méthode `init` est appelée une fois au démarrage de la stratégie. Elle permet d'initialiser les variables de la stratégie, mais aussi d'ajouter des indicateurs techniques.

```ts
import { Context } from '@packages/common';

class Strategy {
    init(context: Context) {
        // Initialisation de la stratégie
    }
}
```

## run

La méthode `run` est appelée dès qu'un événement est déclenché comme par exemple un décalage de barre ou un tick. Elle permet de définir les règles de trading.

```ts
import { Context } from '@packages/common';

class Strategy {
    run(context: Context) {
        // Définition des règles de trading
    }
}
```

## onTick

La méthode `onTick` est un événement qui est déclenché à chaque tick (décalage des prix du marché). Elle permet de définir les règles de trading.

```ts
import { Context } from '@packages/common';

class Strategy {
    onTick(context: Context) {
        // Définition des règles de trading
    }
}
```

## onBar

La méthode `onBar` est un événement qui est déclenché à chaque nouvelle barre qui se forme. Elle permet de définir les règles de trading.

```ts
import { Context } from '@packages/common';

class Strategy {
    onBar(context: Context) {
        // Définition des règles de trading
    }
}
```