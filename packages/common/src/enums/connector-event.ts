export enum ConnectorEvent {
	Authenticated = 'authenticated',
	Disconnected = 'disconnected',
	Error = 'error',
	OHLC = 'ohlc',
	Tick = 'tick',
	Trade = 'trade',
	HistoricalOHLC = 'historical-ohlc',
	OrderCreated = 'order-created',
	OrderClosed = 'order-closed',
}
