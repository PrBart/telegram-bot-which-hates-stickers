const tools = require('./tools.js');
const EventEmitter = require('events').EventEmitter;

const ObjectID = require('mongodb').ObjectID;

const event = new EventEmitter;

function gotCallBackQuery(msg, bot, db, banNominee) {
    bot.answerCallbackQuery(msg.id);
    tools.isUserAdmin(msg, bot).then(confirmed => {
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
                        bot.removeAllListeners('callback_query');


                    }
                    if (msg.data == 'onlyOne') {
                        item.banned.stickers.push(banNominee.sticker_id);
                        const id = {
                            '_id': new ObjectID(item._id)
                        };
                        db.collection('Bots_data').update(id, item);
                        bot.sendMessage(msg.message.chat.id, 'one sticker was banned');
                        bot.removeAllListeners('callback_query');

                    }

                } else {
                    bot.sendMessage(msg.chat.id, 'you have to start the bot with /start@fatfagbot');
                }
            });
        },
        error => {
            bot.answerCallbackQuery(msg.id, 'you are not allowed to use it', true);


        });
}

function actionOnReplySticker(msg, bot, db) {
    tools.isUserAdmin(msg, bot).then(confirmed => {
            tools.isBotAdmin(msg, bot).then(
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



                    bot.on('callback_query', function(msg) {

                        gotCallBackQuery(msg, bot, db, banNominee);

                    });
                },
                error => {
                    bot.sendMessage(msg.chat.id, 'i am not an admin set me as admin');
                }
            );
        },
        error => {
            bot.editMessageText("this user is not allowed to use it", {
                message_id: msg.reply_to_message.message_id,
                chat_id: msg.chat.id
            });

        }
    );
}

function actionOnSticker(msg, bot, db) {

    let chat_id = {
        "chat_id": msg.chat.id
    };

    db.collection('Bots_data').findOne(chat_id, (err, item) => {
        if (item != null) {

            if (item.banned.packs.some(packs => packs == msg.sticker.set_name) == true || item.banned.stickers.some(sticker => sticker == msg.sticker.file_id) == true) {
                bot.deleteMessage(msg.chat.id, msg.message_id);

            } else {

                if (typeof msg.reply_to_message !== 'undefined') {
                    bot.getMe().then(me => {
                        if (msg.reply_to_message.from.id == me.id) {
                            actionOnReplySticker(msg, bot, db);
                        };
                    });
                }
            }
        }
    });
}

module.exports.actionOnSticker = actionOnSticker;