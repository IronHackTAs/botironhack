#!/usr/bin/env node

/* eslint no-console: off */
require('dotenv').config()
const winston = require("winston");
const { combine, timestamp, printf, colorize } = winston.format;
const ironbot = require("./ironbot");
const myFormat = printf(info => {
  return `${info.timestamp} ["BOT"] ${info.level}: ${info.message}`;
});

const logger = new winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({format:'YYYY-MM-DD HH:mm:ss'}), myFormat)
    })
  ]
});

if (!process.env.IRONBOT_TOKEN) {
  logger.error(
    "You must setup the IRONBOT_TOKEN environment variable before running the bot"
  );
  process.exit(1);
}

const options = { logger };
const bot = ironbot(process.env.IRONBOT_TOKEN, options);
bot.start();
