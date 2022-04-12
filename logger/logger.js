const winston = require('winston');

winston.addColors({
    info: 'bold blue', // fontStyle color
    warn: 'italic yellow',
    error: 'bold red',
    debug: 'green',
  });


const logConfiguration = winston.format.combine(winston.format.colorize({ all: true }),
winston.format.label({ label: '[LOGGER]' }),
winston.format.timestamp({ format: 'YY-MM-DD HH:MM:SS' }),
winston.format.printf(
  (info) =>
    ` ${info.label} ${info.timestamp}  ${info.level} : ${info.message}`,
    (debug) =>
    ` ${debug.label} ${debug.timestamp}  ${debug.level} : ${debug.message}`
)
);

const logger = winston.createLogger({transports: [new winston.transports.Console({format: winston.format.combine(logConfiguration)})]});

exports.logger = logger;