import winston from 'winston';

const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(
			(info) =>
				`[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
		)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'logs/combined.log' }),
	],
});

export class LoggerService {
	public log(message: string): void {
		logger.log('info', message);
	}

	public error(message: string): void {
		logger.log('error', message);
	}
}
