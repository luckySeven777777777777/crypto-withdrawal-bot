const { Telegraf } = require('telegraf');

// 使用你提供的 Bot Token 初始化 Telegram Bot
const bot = new Telegraf(process.env.BOT_TOKEN);  // 你可以在 .env 文件中设置 BOT_TOKEN 或者直接使用字符串
bot.launch();

// 发送消息到 Telegram 群
async function sendNotification(message) {
  const chatId = process.env.ADMIN_CHAT_ID || "-1003122480155";  // 使用你提供的群 ID
  if (!chatId) return;
  await bot.telegram.sendMessage(chatId, message);
}

module.exports = { sendNotification };
