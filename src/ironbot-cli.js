#!/usr/bin/env node

/* eslint no-console: off */

const winston = require('winston');
const ironbot = require('./ironbot');


// console.log(winston)
const logger = new winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      timestamp() {
        return (new Date()).toISOString();
      },
    }),
  ],
});

// logger.cli();

if (!process.env.IRONBOT_TOKEN) {
  logger.error('You must setup the IRONBOT_TOKEN environment variable before running the bot');
  process.exit(1);
}

const options = { logger };


const bot = ironbot(process.env.IRONBOT_TOKEN, options);
bot.start();
