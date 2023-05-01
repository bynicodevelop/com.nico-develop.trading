# Account

Permet de récupérer les informations sur le compte de trading.

## Classe `AccountService`

Est accessible pas le biais de la méthode [getAccountService](./common.md#récupérer-le-service-de-compte) de la classe [Context](./common.md).

## Récupérer les informations sur le compte

```ts
try {
    const account = await accountService.getAccount();
} catch (error: any) {
	if (error instanceof Exception) {
	    console.log(error.code);
	}

	console.log(error.message);
}
```