const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');

// 1. Tokenኑን በ Render ውስጥ ስለምንደብቀው እዚህ ጋር እንዲህ ይጻፋል
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(cors());
app.use(express.json());

let usersDB = {}; // የሰዎች ብር ለጊዜው እዚህ ይቀመጣል

// 2. ጨዋታው ሲያልቅ ውጤት መቀበያ
app.post('/secure-win', (req, res) => {
    const { userId, winAmount, secretKey } = req.body;
    if (secretKey === "BINGO_SECRET_99" && usersDB[userId]) {
        usersDB[userId].balance += winAmount;
        bot.telegram.sendMessage(userId, `እንኳን ደስ አለዎት! 🎉 ${winAmount} ብር አሸንፈው ሂሳብዎ ${usersDB[userId].balance} ሆኗል።`);
    }
    res.sendStatus(200);
});

bot.start((ctx) => {
    const userId = ctx.from.id;
    if (!usersDB[userId]) usersDB[userId] = { balance: 100 };
    ctx.reply(`ሰላም ${ctx.from.first_name}! ሂሳብዎ፡ ${usersDB[userId].balance} ETB`, 
    Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 ጨዋታ ጀምር', `https://gebre-love.github.io/Bingo_game1/?userId=${userId}`)]
    ]));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running`));
bot.launch();
