const appRoot = require('app-root-path');
const winston = require('winston');
const {RedisLogCache} = require('../helpers/redislogcache');

// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};


let alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
      all:true
  }),
  winston.format.label({
      label:'[DSCI]'
  }),
  winston.format.timestamp({
      format:"YYYY-MM-DD HH:MM:SS"
  }),
  winston.format.printf(
      info => {
        const formattedInfo = `{ "label": "${info.label}" , "timestamp": "${info.timestamp}" , "level": "${info.level}" , "message" : "${info.message.replace(/"/g, "")}" }`
        const formattedMsg = { "label": info.label , "timestamp": info.timestamp , "level": info.level , "message" : info.message.replace(/"/g, "") }
        RedisLogCache(formattedMsg);
        return formattedInfo;
      }
  )
);

// instantiate a new Winston Logger with the settings defined above
const logger = new winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.json(),  winston.format.combine(winston.format.printf(
    info => {
      // console.log(JSON.parse(info[Object.getOwnPropertySymbols(info)[1]]))
      const formattedInfo = `{ "level": "${info.level}" , "message" : "${info.message.replace(/"/g, "")}" }`
      return formattedInfo;
    }
))),
  transports: [
    new (winston.transports.File)({ filename: `${appRoot}/logs/error.log`, level: 'error' }),
    new winston.transports.File(options.file),
    // new winston.transports.Console(options.console)
    new (winston.transports.Console)({
      format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
  })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: `${appRoot}/logs/exceptions.log` }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});


// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    const ind = /1.1/.exec(message).index;
    let code = parseInt(message.substring(ind+5,ind+8));
    if (code > 100 && code < 299) {
      logger.info(message.substring(0,message.lastIndexOf('\n')));
    } else if (code > 299 && code < 399) {
      logger.notice(message.substring(0,message.lastIndexOf('\n')));
    } else if (code > 399 && code < 599) {
      logger.error(message.substring(0,message.lastIndexOf('\n')));
    }
  },
};





module.exports = logger;