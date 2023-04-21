import { EventEmitter } from 'events';

import {
	IConnector,
	IContext,
} from '@packages/common';
import { StrategyBase } from '@packages/strategy';

import { Connector } from './connector';

// Créez un mock pour la stratégie
const strategyMock: StrategyBase = {
	init: jest.fn(),
	run: jest.fn(),
	onTick: jest.fn(),
	onBar: jest.fn(),
};

// Créez un mock pour le connecteur avec EventEmitter

class MockConnector extends EventEmitter implements Partial<IConnector> {
	run = jest.fn();
}

const connectorMock = new MockConnector();

// Créez une instance de la classe Connector en utilisant les mocks
const connector = new Connector(strategyMock, connectorMock);

describe('Connector', (): void => {
	beforeEach((): void => {
		jest.clearAllMocks();
	});

	it('should call the init method of the strategy with the correct context when authenticated event is emitted', () => {
		const context: IContext = {};

		connector.run();
		connectorMock.emit('authenticated', context);

		expect(strategyMock.init).toHaveBeenCalledTimes(1);
		expect(strategyMock.init).toHaveBeenCalledWith(context);
	});

	it('should call the run method of the connector', (): void => {
		connector.run();

		expect(connectorMock.run).toHaveBeenCalledTimes(1);
	});
});
