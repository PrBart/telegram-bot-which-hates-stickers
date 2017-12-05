"use strict";
const mongoClient = require('mongodb').MongoClient;
const config = require('./config.js');
const TelegramBot = require('node-telegram-bot-api');

const commands = require('./src/commands.js');

const events = require('./src/events.js');

const db = config.url;
const collectionName = config.collectionName;
const bot = new TelegramBot(config.token, {
    polling: true
});

let botName = '';

(bot.getMe().then(me => {
    botName = me.username;
    return botName;
}));



console.log('bot started');



mongoClient.connect(db, function(err, db) {
    if (err) {
        return console.log(err);
    }
    db.collectionName = collectionName;
    bot.onText(new RegExp('/start@' + botName), function(msg) {
        commands.start(msg, bot, db);
    });

    bot.onText(new RegExp('/ban@' + botName), function(msg) {
        commands.ban(msg, bot, db);
    });
    bot.on('sticker', function(msg) {
        events.actionOnSticker(msg, bot, db);
    });
    bot.onText(new RegExp('/reset@' + botName), function(msg) {
        commands.reset(msg, bot, db);
    });
});