# Création d'une stratégie

La création d'une stratégie se fait en 2 étapes :

- Définition d'une stratégie
- Démarrage d'une stratégie

## Définition d'une stratégie

Une stratégie est un fichier JavaScript. La class `StrategyBase` est une interface qui permet de définir les méthodes utilisées par le moteur de stratégie.

```ts
import { Context } from '@packages/common';
import { StrategyBase } from '@packages/strategy';

class Strategy implements StrategyBase {
    init(context: Context) { ... }

    run(context: Context) { ... }

    onTick(context: Context) { ... }

    onBar(context: Context) { ... }
}
```

## Demarrage d'une stratégie

Une stratégie est démarrée par un connecteur. Un connecteur une factory qui permet de lier une stratégie à une API de trading.

```ts
import {
	AlpacaConnector,
	AlpacaService,
} from '@packages/connectors';

import {
	Config,
	Connector,
} from '@packages/connector';

// Stratégie créée précédemment

const connector = new Connector(
	new Strategy(),
	new AlpacaConnector(
		new AlpacaService({
			KEY: Config.KEY,
			SECRET: Config.SECRET,
		})
	)
);

(async (): Promise<void> => {
	await connector.run();
})();
```