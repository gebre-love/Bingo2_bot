const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');

// 1. የቦት Token በ Render Environment Variable ውስጥ መደበቅ አለበት
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(cors({ origin: 'https://gebre-love.github.io' })); // ከሌላ ቦታ መረጃ እንዳይቀበል ይከላከላል
app.use(express.json());

// ተጫዋቾች ለጊዜው እዚህ ይቀመጣሉ (በኋላ ከ MongoDB ጋር እናያይዘዋለን)
let usersDB = {};

// 2. ተጫዋቹ ሲያሸንፍ በምስጢር መረጃ መቀበያ
app.post('/secure-win', (req, res) => {
    const { userId, winAmount, secretKey } = req.body;
    
    // የውሸት አሸናፊነትን ለመከላከል ሚስጥራዊ ቁልፍ
    if (secretKey !== "BINGO_SECRET_99") {
        return res.status(403).send("Unauthorized Access!");
    }

    if (usersDB[userId]) {
        usersDB[userId].balance += winAmount;
        bot.telegram.sendMessage(userId, `እንኳን ደስ አለዎት! 🎉 ${winAmount} ETB አሸንፈው ቀሪ ሂሳብዎ ${usersDB[userId].balance} ETB ሆኗል።`);
    }
    res.sendStatus(200);
});

bot.start((ctx) => {
    const userId = ctx.from.id;
    if (!usersDB[userId]) usersDB[userId] = { balance: 100 };
    
    ctx.replyWithMarkdown(`*እንኳን ወደ Addis Bingo በደህና መጡ!* 🍀\n\n💰 ቀሪ ሂሳብዎ፡ *${usersDB[userId].balance} ETB*`, 
    Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 ጨዋታውን ጀምር', `https://gebre-love.github.io/Bingo_game1/?userId=${userId}`)]
    ]));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure Server on port ${PORT}`));
bot.launch();
