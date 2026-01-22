const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(express.json());

// ጨዋታው ሲያልቅ ውጤት መቀበያ
app.post('/secure-win', (req, res) => {
    const { userId, winAmount, secretKey } = req.body;
    if (secretKey === "BINGO_SECRET_99") {
        bot.telegram.sendMessage(userId, `🎉 እንኳን ደስ አለዎት! ${winAmount} ብር አሸንፈዋል።`);
    }
    res.sendStatus(200);
});

bot.start((ctx) => {
    ctx.reply(`ሰላም ${ctx.from.first_name}! እንኳን ወደ አዲስ ቢንጎ መጡ።`, 
    Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 ጨዋታ ጀምር', `https://gebre-love.github.io/Bingo_game1/?userId=${ctx.from.id}`)]
    ]));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running'));
bot.launch();
