const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(cors());
app.use(express.json());

// ጊዜያዊ የሂሳብ መዝገብ (ዳታቤዝ እስክናገናኝ ድረስ)
let usersDB = {};

// ጨዋታው ሲያልቅ ውጤት መቀበያ መስመር
app.post('/secure-win', (req, res) => {
    const { userId, winAmount, secretKey } = req.body;
    // ሚስጥራዊ ቁልፉ ትክክል መሆኑን እና ተጠቃሚው መኖሩን ማረጋገጥ
    if (secretKey === "BINGO_SECRET_99" && usersDB[userId]) {
        usersDB[userId].balance += winAmount;
        bot.telegram.sendMessage(userId, `🎉 እንኳን ደስ አለዎት! ${winAmount} ብር አሸንፈዋል። አጠቃላይ ሂሳብዎ፡ ${usersDB[userId].balance} ETB ሆኗል።`);
    }
    res.sendStatus(200);
});

// ቦቱ ሲጀመር (Start) የሚሰጠው ምላሽ
bot.start((ctx) => {
    const userId = ctx.from.id;
    // ተጠቃሚው አዲስ ከሆነ 100 ብር ስጦታ መስጠት
    if (!usersDB[userId]) {
        usersDB[userId] = { balance: 100 };
    }
    
    ctx.reply(`ሰላም ${ctx.from.first_name}! እንኳን ወደ አዲስ ቢንጎ መጡ።\n💰 የአሁኑ ሂሳብዎ፡ ${usersDB[userId].balance} ETB`, 
    Markup.inlineKeyboard([
        // ትክክለኛው የጨዋታ ሊንክ እዚህ ጋር ተስተካክሏል
        [Markup.button.webApp('🎮 ጨዋታ ጀምር', `https://gebre-love.github.io/Bingo2_bot/?userId=${userId}`)]
    ]));
});

// ሰርቨሩን በፖርት 10000 ላይ ማስነሳት
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

bot.launch();

// ለደህንነት ሲባል ሰርቨሩ ሲዘጋ ቦቱንም ማቆም
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
