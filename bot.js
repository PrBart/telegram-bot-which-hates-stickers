"use strict";
const mongoClient = require('mongodb').MongoClient;
const config = require('./config.js');
const TelegramBot = require('node-telegram-bot-api');

const db = config.url;

let ObjectID = require('mongodb').ObjectID;

const bot = new TelegramBot(config.token, {
    polling: true
});

let botName = '';

(bot.getMe().then(me => {
        botName = me.username;
        return botName;
    })
);



console.log('bot started');

function AmIAdmin(msg) {
    return new Promise(function(resolve, reject) {
        Promise.all([bot.getChatAdministrators(msg.chat.id), bot.getMe()]).then(results => {
            for (let i = 0; i < results[0].length; i++) {
                if (results[0][i].user.id == results[1].id) {
                    resolve('true');
                };
            };
            reject('false');
        });
    });
}


function isUserAdmin(msg) {
    if (msg.chat === undefined) {
        msg.chat = msg.message.chat;
    }
    return new Promise(function(resolve, reject) {
        bot.getChatAdministrators(msg.chat.id).then(admins => {
            for (let i = 0; i < admins.length; i++) {
                if (admins[i].user.id == msg.from.id) {
                    resolve('true');
                };
            };
            reject('false');
        });
    });
}



mongoClient.connect(db, function(err, db) {
    if (err) {
        return console.log(err);
    }
    bot.onText(new RegExp('/start@'+botName), function(msg) {
        AmIAdmin(msg).then(
            confirmed => {

                let chat_id = {
                    "chat_id": msg.chat.id
                };

                db.collection('Bots_data').findOne(chat_id, (err, item) => {

                    if (item == null) {
                        let data = {
                            "chat_id": msg.chat.id,
                            "banned": {
                                "packs": [

                                ],
                                "stickers": [

                                ]
                            }
                        };

                        db.collection('Bots_data').insert(data, (err, results) => {});
                        bot.sendMessage(msg.chat.id, 'each admin of this conversastion can send me stiicker in reply and i will ban this sticker or entire pack');
                    } else {
                        bot.sendMessage(msg.chat.id, 'database for your conversation already been creasted, send me sticker as a replay if you want to ban it or ban intire pack, if youy want to reset sticker list of banned sticlers and packs type /reset@fatfagbot');
                    }
                });
            },
            error => {
                bot.sendMessage(msg.chat.id, 'i am not an amdin in this conversetion, please set me as an admin');

            }
        );
    });
    bot.onText(new RegExp('/ban@'+botName), function(msg) {
        if (msg.chat.type != 'private') {
            AmIAdmin(msg).then(
                confirmed => {
                    let chat_id = {
                    "chat_id": msg.chat.id
                    };
                    db.collection('Bots_data').findOne(chat_id, (err, item) => {
                      if (item != null) {
                    bot.sendMessage(msg.chat.id, 'send me sticker which you want to ban');
                      }else {
                        bot.sendMessage(msg.chat.id, 'you have to use /start@fatfagbot to activate bot in this chat');
                      }
                    });

                },
                error => {
                    bot.sendMessage(msg.chat.id, 'i am not an admin set me as admin');
                }
            );
        }
    });


    bot.on('sticker', function(msg) {

        let chat_id = {
            "chat_id": msg.chat.id
        };

        db.collection('Bots_data').findOne(chat_id, (err, item) => {
            if (item != null) {

              if(item.banned.packs.some(packs => packs == msg.sticker.set_name) == true || item.banned.stickers.some(sticker => sticker == msg.sticker.file_id) == true){
                  bot.deleteMessage(msg.chat.id, msg.message_id);

              }else{
              
                if (typeof msg.reply_to_message !== 'undefined') {
                    bot.getMe().then(me => {
                        if (msg.reply_to_message.from.id == me.id) {

                            isUserAdmin(msg).then(confirmed => {
                                    AmIAdmin(msg).then(
                                        confirmed => {
                                            const banNominee = {
                                                pack_name: msg.sticker.set_name,
                                                sticker_id: msg.sticker.file_id
                                            }
                                            const opt = {
                                                parse_mode: 'markdown',
                                                disable_web_page_preview: false,
                                                reply_markup: JSON.stringify({
                                                    inline_keyboard: [
                                                        [{
                                                                text: `entire pack`,
                                                                callback_data: 'entire'
                                                            },
                                                            {
                                                                text: `only this sticker`,
                                                                callback_data: 'onlyOne'
                                                            }
                                                        ]
                                                    ]
                                                })
                                            }
                                            bot.sendMessage(msg.chat.id, 'do you want to ban entire pack or only one sticker?', opt);

                                            bot.once('callback_query', function(msg) {
                                                bot.answerCallbackQuery(msg.id);
                                                isUserAdmin(msg).then(confirmed => {
                                                        let chat_id = {
                                                            "chat_id": msg.message.chat.id
                                                        };
                                                        db.collection('Bots_data').findOne(chat_id, (err, item) => {
                                                            if (item != null) {
                                                                if (msg.data == 'entire') {
                                                                    item.banned.packs.push(banNominee.pack_name);
                                                                    const id = {
                                                                        '_id': new ObjectID(item._id)
                                                                    };
                                                                    db.collection('Bots_data').update(id, item);
                                                                    bot.sendMessage(msg.message.chat.id, 'entire pack was banned');


                                                                }
                                                                if (msg.data == 'onlyOne') {
                                                                    item.banned.stickers.push(banNominee.sticker_id);
                                                                    const id = {
                                                                        '_id': new ObjectID(item._id)
                                                                    };
                                                                    db.collection('Bots_data').update(id, item);
                                                                    bot.sendMessage(msg.message.chat.id, 'one sticker was banned');


                                                                }

                                                            } else {
                                                                bot.sendMessage(msg.chat.id, 'you have to start the bot with /start@fatfagbot');
                                                            }
                                                        });
                                                    },
                                                    error => {
                                                        bot.answerCallbackQuery(msg.id, 'you are not allowed ti use it', true);


                                                    });

                                            });
                                        },
                                        error => {
                                            bot.sendMessage(msg.chat.id, 'i am not an admin set me as admin');
                                        }
                                    );
                                },
                                error => {
                                    bot.editMessageText("this user are not allowed to use it", {message_id: msg.reply_to_message.message_id, chat_id: msg.chat.id});
                        
                                }
                            );
                        };
                    });
                }
              }
            } 
        });

    });


    bot.onText(new RegExp('/reset@'+botName), function(msg) {
        isUserAdmin(msg).then(
            confirmed => {
                let chat_id = {
                    "chat_id": msg.chat.id
                };
                db.collection('Bots_data').findOne(chat_id, (err, item) => {
                    if (item != null) {
                        const clearFields = {
                            "chat_id": msg.chat.id,
                            "banned": {
                                "packs": [

                                ],
                                "stickers": [

                                ]
                            }
                        }
                        const id = {
                            '_id': new ObjectID(item._id)
                        };
                        db.collection('Bots_data').update(id, clearFields);
                        bot.sendMessage(msg.chat.id, 'list of banned stickers and sticker packs was cleared');
                    }
                });
            }
        );
    });
});