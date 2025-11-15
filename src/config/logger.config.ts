import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, printf } = format;

export const loggerFormat = combine(
  timestamp(),
  printf(({ level, message, timestamp, context, trace }) => {
    const contextStr = context
      ? `[${typeof context === 'string' ? context : JSON.stringify(context)}]`
      : '[Application]';
    const traceStr = trace
      ? `\nStack Trace: ${typeof trace === 'string' ? trace : JSON.stringify(trace)}`
      : '';
    return `${String(timestamp)} ${String(level)}: ${contextStr} ${String(message)}${traceStr}`;
  }),
);

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, context }) => {
          const contextValue = context
            ? typeof context === 'string'
              ? context
              : JSON.stringify(context)
            : 'Application';
          return `${String(timestamp)} [${contextValue}] ${String(level)}: ${String(message)}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
  // Dont exit on error
  exitOnError: false,
};
