// bot.js
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.launch();

async function sendNotification(message) {
  const chatId = process.env.ADMIN_CHAT_ID;
  if (!chatId) return;
  await bot.telegram.sendMessage(chatId, message);
}

module.exports = { sendNotification };
