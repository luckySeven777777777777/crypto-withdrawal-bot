import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN not found.");
    process.exit(1);
}

export const bot = new Telegraf(BOT_TOKEN);

// ========== 机器人指令 ==========
bot.start((ctx) => {
    ctx.reply(
        "🤖 Welcome!\nThis bot is connected to your withdrawal system.\nYou will receive withdrawal notifications here."
    );
});

bot.command("admin", (ctx) => {
    ctx.reply(`Your admin chat id: ${ctx.chat.id}`);
});

// ========== 自定义函数：发送提现通知 ==========
export async function notifyAdmin({ coin, amount, wallet, hash }) {
    try {
        await bot.telegram.sendMessage(
            ADMIN_CHAT_ID,
            `💸 *Withdrawal Request*\n\n` +
            `• Coin: *${coin}*\n` +
            `• Amount: *${amount}*\n` +
            `• Wallet: \`${wallet}\`\n` +
            `• TxHash: \`${hash}\`\n`,
            { parse_mode: "Markdown" }
        );
    } catch (err) {
        console.error("❌ Failed to send message:", err);
    }
}

// ========== 注意：这里不启动 bot.launch()！！！ ==========
// Webhook 模式下启动在 server.js 中，调用 bot.webhookCallback()
