# Indicators

## Nom

Permet la récupération du nom de l'indicateur. Principalement utilisé par le connecteur pour récupérer le nom de l'indicateur.

```ts
get name(): string;
```

## Initialiser l'indicateur

Permet de définir les valeurs initiales de l'indicateur. Utilisé par le connecteur pour initialiser l'indicateur avec les données historiques.

```ts
init(values: OHLC[]): void;
```

## Mise à jour de l'indicateur

Permet de mettre à jour l'indicateur avec une nouvelle valeur. Utilisé par le connecteur pour mettre à jour l'indicateur avec les nouvelles données.

```ts
nextValue(value: OHLC): void;
```

## Retourne la valeur de l'indicateur à l'index donné

Permet de récupérer la valeur de l'indicateur à l'index donné. Utilisable dans les stratégies pour récupérer la valeur de l'indicateur à un instant donné.

```ts
getValue(index: number): number | null;
```

## Retourne les valeurs de l'indicateur

Permet de récupérer les valeurs de l'indicateur. Utilisable dans les stratégies pour récupérer les valeurs de l'indicateur.

```ts
getValues(): number[];
```

## Retourne la dernière valeur de l'indicateur

Permet de récupérer la dernière valeur de l'indicateur. Utilisable dans les stratégies pour récupérer la dernière valeur de l'indicateur.

```ts
getLastValue(): number | null;
```