# Démarrage rapide

## Structure d'une stratégie

Dans le dossier `strategies` créer un dossier de stratégie avec la structure suivante :

```
strategies
└───my-strategy
	│   index.ts
	|   .env
	│   package.json
	│   tsconfig.json
```

## Initialisation du projet

Pour créer le projet, il suffit de lancer la commande suivante :

```bash
$ npm init -y
```

Ajouter dans le fichier `package.json` la configuration suivante : 

```json
{
	"name": "my-strategy",
	"main": "index.ts",
	"scripts": {
		"start": "ts-node index.ts",
		"dev": "ts-node-dev --respawn --transpile-only index.ts"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"dependencies": {
		"@packages/common": "workspace:^",
		"@packages/connector": "workspace:^",
		"@packages/connectors": "workspace:^",
		"@packages/indicators": "workspace:^",
		"@packages/strategy": "workspace:^",
		"dotenv": "^16.0.3",
		"ts-node-dev": "^2.0.0"
	},
	"devDependencies": {
		"ts-node": "^10.9.1"
	}
}
```

Pensez à installer les dépendances :

```bash
$ pnpm install
```

> **Note** : Mettez vous à la racine globale du projet et non dans le dossier pour installer toutes les dépendances du projet.

## Fichier de configuration

Créer un fichier `.env` à la racine votre stratégie (même niveau que votre fichier `index.ts`) avec la configuration suivante :

```bash
# Clé d'API
KEY=******
## Clé secrète
SECRET=******
```