// server.js
import express from "express";
import bodyParser from "body-parser";
import { sendWithdrawalMessage, handleCallback } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求
app.use(bodyParser.json());
app.use(express.static("public"));

// 提现请求接口
app.post("/withdraw", async (req, res) => {
  try {
    const data = req.body; 
    if (!data || !data.coin || !data.wallet || !data.txHash) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    await sendWithdrawalMessage(data);
    res.json({ ok: true, message: "Withdrawal message sent to Telegram" });
  } catch (err) {
    console.error("Error in /withdraw:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// Telegram webhook 回调
app.post("/telegram-webhook", async (req, res) => {
  try {
    const body = req.body;
    if (body.callback_query) {
      await handleCallback(body.callback_query);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Error in /telegram-webhook:", err);
    res.sendStatus(500);
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
