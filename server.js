const express = require("express");
const path = require("path");
const cors = require("cors");
const { Telegraf } = require("telegraf");

const app = express();
app.use(cors());
app.use(express.json());

// ===== 环境变量 =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN || !WEBHOOK_URL) {
    console.error("❌ BOT_TOKEN 或 WEBHOOK_URL 未设置");
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// 🚫 停止 Polling，避免 409 冲突
bot.stop(() => {});

// === Telegram Webhook ===
app.use(bot.webhookCallback("/telegraf"));

// 启动后再设置 webhook，不使用 await
bot.telegram.setWebhook(`${WEBHOOK_URL}/telegraf`)
    .then(() => console.log("✅ Webhook 设置成功:", `${WEBHOOK_URL}/telegraf`))
    .catch(err => console.error("❌ Webhook 设置失败:", err));

// ===== 钱包 API =====
let userwallet = null;

app.get("/api/wallet", (req, res) => {
    res.json({ wallet: userwallet });
});

app.post("/api/wallet", (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ success: false, error: "Wallet required" });

    userwallet = wallet;
    res.json({ success: true, wallet });
});

// ===== 提现 API =====
app.post("/api/withdraw", async (req, res) => {
    const { amount, wallet, coin } = req.body;

    const hash = "TX-" + Date.now();

    await bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `💸 Withdrawal Request\nCoin：${coin}\nAmount：${amount}\nWallet：${wallet}\nTxHash：${hash}`
    );

    res.json({ success: true, hash });
});

// ===== 静态文件 =====
const ROOT = path.resolve();
app.use(express.static(path.join(ROOT, "public")));

app.get("*", (req, res) => {
    res.sendFile(path.join(ROOT, "public", "index.html"));
});

// ==== 启动 ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
