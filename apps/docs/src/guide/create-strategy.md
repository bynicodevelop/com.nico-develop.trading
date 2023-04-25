# Création d'une stratégie

La première étape est de créer un dossier de stratégie comment expliqué dans le [Démarrage rapide](./getting-started.md).

Une fois la structure de la stratégie créée, il mettre en place un connecteur pour démarrer la stratégie.

## Mise en place d'un connecteur

Une stratégie est démarrée par un connecteur. Un connecteur une factory qui permet de lier une stratégie à une API de trading.

> :information_source: Une API sous entend un service de trading. Par exemple, Alpaca est un service de trading qui propose une API.

## Connecteur Alpaca

La libraire [Traderbook](/) propose un connecteur pour Alpaca. Il est possible de créer son propre connecteur pour une autre API.

```ts
import {
	AlpacaConnector,
	AlpacaService,
} from '@packages/connectors';

import {
	Config,
	Connector,
} from '@packages/connector';

// ... Votre stratégie de trading

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

## Connecteur de backtest

Il est possible de tester une stratégie en backtest. Pour cela, il faut utiliser le connecteur de backtest intégré à Traderbook.

```ts
import { 
	AlpacaBacktestService, 
	BacktestConnector 
} from '@packages/connectors';

import {
	Config,
	Connector,
} from '@packages/connector';

// ... Votre stratégie de trading

const connector = new Connector(
	new Strategy(),
	new BacktestConnector(
		new AlpacaBacktestService({ 
			KEY: Config.KEY, 
			SECRET: Config.SECRET 
		}, 
		1000 // Capital de départ
		),
		{
			start: subtractTimeFromDate(new Date(), 0, 0, 0, 3),
			end: new Date(), // optional
		},
		300 // Interval entre les évènements en millisecondes
	)
);

(async (): Promise<void> => {
	console.log('Starting strategy...');

	await connector.run();
})();
```