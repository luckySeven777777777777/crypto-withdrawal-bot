let bot = null;

if (process.env.BOT_TOKEN && process.env.ADMIN_CHAT_ID) {
  const { Telegraf } = require('telegraf');
  bot = new Telegraf(process.env.BOT_TOKEN);

  bot.on('callback_query', ctx => {
    const data = ctx.callbackQuery.data;
    if (data === "withdraw_success") {
      ctx.reply("提现成功确认 ✔");
    } else if (data === "withdraw_cancel") {
      ctx.reply("提现已取消 ✖");
    }
    ctx.answerCbQuery();
  });

  bot.launch().then(() => console.log("Telegram Bot started"));
}

async function sendWithdrawNotification(record) {
  if (!bot) {
    console.log("模拟通知:", record);
    return;
  }

  const chat_id = process.env.ADMIN_CHAT_ID;
  if (!chat_id) return;

  const msg = `用户提现申请:\n金额: ${record.amount}\n钱包: ${record.wallet}`;
  await bot.telegram.sendMessage(chat_id, msg, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✔ 成功", callback_data: "withdraw_success" },
          { text: "✖ 取消", callback_data: "withdraw_cancel" }
        ]
      ]
    }
  });
}

module.exports = { sendWithdrawNotification };
