const  tools = require('./tools.js');

const ObjectID = require('mongodb').ObjectID;

function start (msg,bot,db) {
        tools.isBotAdmin(msg,bot).then(
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
                        bot.sendMessage(msg.chat.id, 'each admin of this conversation can send me stiicker in reply and i will ban this sticker or entire pack');
                    } else {
                        bot.sendMessage(msg.chat.id, 'database for your conversation already been creasted, send me sticker as a replay if you want to ban it or ban intire pack, if youy want to reset sticker list of banned sticlers and packs type /reset@fatfagbot');
                    }
                });
            },
            error => {
                bot.sendMessage(msg.chat.id, 'i am not an amdin in this conversation, please set me as an admin');

            }
        );
};

function ban (msg,bot,db) {
        if (msg.chat.type != 'private') {
            tools.isBotAdmin(msg,bot).then(
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
};

function reset (msg,bot,db) {

    tools.isUserAdmin(msg,bot).then(
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

};

module.exports.ban = ban;

module.exports.start = start;

module.exports.reset = reset;


