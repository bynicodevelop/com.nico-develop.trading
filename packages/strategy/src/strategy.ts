import { Context } from '@packages/common';

interface IStrategy {
	init(context: Context): void;
	run(context: Context): void;
	onTick(context: Context): void;
	onBar(context: Context): void;
}

export type StrategyBase = IStrategy;
