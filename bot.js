const { Telegraf, Markup } = require('telegraf');

// 1. ያንተ Token እዚህ ገብቷል
const bot = new Telegraf('8589785739:AAEBHov5zA1YLm0QQIYdh8fXgydBZvhSMUo');

// 2. የተጫዋቾች መዝገብ (ለጊዜው በሜሞሪ)
let usersDB = {};

// 3. ቦቱ ሲጀመር (/start)
bot.start((ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    // አዲስ ተጫዋች ከሆነ የ 100 ብር ስጦታ መስጠት
    if (!usersDB[userId]) {
        usersDB[userId] = { balance: 100, name: userName };
    }

    ctx.reply(`እንኳን ወደ Addis Bingo በደህና መጡ ${userName}! 🍀\n\nየአሁኑ ቀሪ ሂሳብዎ፡ ${usersDB[userId].balance} ETB`, 
    Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Play 10', 'https://gebre-love.github.io/Bingo_game1/'), 
         Markup.button.webApp('🎮 Play 20', 'https://gebre-love.github.io/Bingo_game1/')],
        [Markup.button.webApp('🎮 Play 50', 'https://gebre-love.github.io/Bingo_game1/'), 
         Markup.button.webApp('🎮 Play 100', 'https://gebre-love.github.io/Bingo_game1/')],
        [Markup.button.callback('💰 ሂሳብ ለመፈተሽ', 'check_balance')]
    ]));
});

// 4. ሂሳብ ለመፈተሽ (Check Balance)
bot.action('check_balance', (ctx) => {
    const userId = ctx.from.id;
    const bal = usersDB[userId] ? usersDB[userId].balance : 0;
    ctx.answerCbQuery();
    ctx.reply(`የእርስዎ ቀሪ ሂሳብ፡ ${bal} ETB ነው።`);
});

// 5. ቦቱን ማስጀመር
bot.launch();
console.log("Bingo Bot is running...");
