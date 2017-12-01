function isBotAdmin(msg,bot) {
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


function isUserAdmin(msg,bot) {
    if (!msg.chat) {
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

module.exports.isBotAdmin = isBotAdmin;
module.exports.isUserAdmin = isUserAdmin;
