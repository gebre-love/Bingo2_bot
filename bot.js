const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// Render ላይ ከሞላናቸው Variables የሚመጡ
const token = process.env.BOT_TOKEN;
const mongoURI = process.env.MONGO_URI;

// ያንተ መለያ ቁጥር (Admin ID)
const ADMIN_ID = 7423347375; 

const bot = new TelegramBot(token, {polling: true});

// የዳታቤዝ ግንኙነት (MongoDB)
mongoose.connect(mongoURI)
  .then(() => console.log('✅ ዳታቤዝ ተገናኝቷል!'))
  .catch(err => console.log('❌ የዳታቤዝ ስህተት:', err));

// የተጫዋች መረጃ አያያዝ (Schema)
const userSchema = new mongoose.Schema({
  chatId: Number,
  name: String,
  balance: { type: Number, default: 100 }
});
const User = mongoose.model('User', userSchema);

// /start ሲባል
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let user = await User.findOne({ chatId });
  if (!user) {
    user = new User({ chatId, name: msg.from.first_name });
    await user.save();
  }
  bot.sendMessage(chatId, `ሰላም ${user.name}! እንኳን ወደ አዲሱ ቢንጎ መጡ።\n💰 የአሁኑ ሂሳብዎ: ${user.balance} ETB\n\nብር ለማስገባት የክፍያ ደረሰኝ (Screenshot) ይላኩ።`);
});

// ተጫዋች ፎቶ ሲልክ (Deposit Request)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name;

  // ለተጫዋቹ የሚላክ ምላሽ
  bot.sendMessage(chatId, "✅ ደረሰኙ ደርሶናል! Admin አረጋግጦ ብር እስኪጨምርልዎ ድረስ እባክዎ በትዕግስት ይጠብቁ።");

  // ለአንተ (Admin) የሚመጣ መልእክት
  await bot.forwardMessage(ADMIN_ID, chatId, msg.message_id);
  bot.sendMessage(ADMIN_ID, `📩 አዲስ የክፍያ ጥያቄ!\n👤 ስም: ${username}\n🆔 ID: ${chatId}\n\nብር ለመጨመር ይህንን ይጻፉ፡\n/add ${chatId} [መጠን]`);
});

// ብር ለመጨመር (ለአንተ ብቻ የሚሰራ)
bot.onText(/\/add (\d+) (\d+)/, async (msg, match) => {
  if (msg.chat.id == ADMIN_ID) {
    const targetId = match[1];
    const amount = parseInt(match[2]);

    let user = await User.findOne({ chatId: targetId });
    if (user) {
      user.balance += amount;
      await user.save();
      bot.sendMessage(ADMIN_ID, `✅ ለተጫዋች ${user.name} (${targetId}) ${amount} ETB ተጨምሯል።`);
      bot.sendMessage(targetId, `🎊 እንኳን ደስ አለዎት! አካውንትዎ በ ${amount} ETB ታድሷል።\n💰 የአሁኑ ሂሳብዎ: ${user.balance} ETB`);
    } else {
      bot.sendMessage(ADMIN_ID, "❌ ይህ ተጫዋች በዳታቤዝ ውስጥ አልተገኘም።");
    }
  }
});
