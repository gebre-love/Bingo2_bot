const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

const token = process.env.BOT_TOKEN;
const mongoURI = process.env.MONGO_URI;
const ADMIN_ID = 7423347375; 

const bot = new TelegramBot(token, {polling: true});

mongoose.connect(mongoURI)
  .then(() => console.log('✅ ዳታቤዝ ተገናኝቷል!'))
  .catch(err => console.log('❌ የዳታቤዝ ስህተት:', err.message));

const User = mongoose.model('User', new mongoose.Schema({
  chatId: Number,
  name: String,
  balance: { type: Number, default: 100 }
}));

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    let user = await User.findOne({ chatId });
    if (!user) {
      user = new User({ chatId, name: msg.from.first_name });
      await user.save();
    }
    bot.sendMessage(chatId, `ሰላም ${user.name}! እንኳን ደህና መጡ።\n💰 ሂሳብዎ: ${user.balance} ETB`);
  } catch (e) { console.log(e); }
});

bot.on('photo', async (msg) => {
  bot.sendMessage(msg.chat.id, "✅ ደረሰኙ ደርሶናል! Admin እስኪያረጋግጥ ይጠብቁ።");
  await bot.forwardMessage(ADMIN_ID, msg.chat.id, msg.message_id);
  bot.sendMessage(ADMIN_ID, `📩 አዲስ ክፍያ ከ: ${msg.from.first_name}\nID: ${msg.chat.id}\nለመጨመር: /add ${msg.chat.id} [መጠን]`);
});

bot.onText(/\/add (\d+) (\d+)/, async (msg, match) => {
  if (msg.chat.id == ADMIN_ID) {
    const targetId = match[1];
    const amount = parseInt(match[2]);
    let user = await User.findOne({ chatId: targetId });
    if (user) {
      user.balance += amount;
      await user.save();
      bot.sendMessage(targetId, `🎊 አካውንትዎ በ ${amount} ETB ታድሷል!`);
      bot.sendMessage(ADMIN_ID, `✅ ለ ${targetId} ${amount} ETB ተጨምሯል።`);
    }
  }
});
