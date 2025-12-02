import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// 模拟数据库（你可以替换成真实数据库）
let userWallet = null;

// ⭐ 1) 获取钱包
app.get("/api/wallet", (req, res) => {
    res.json({ wallet: userWallet });
});

// ⭐ 2) 绑定或修改钱包
app.post("/api/wallet", (req, res) => {
    const { wallet, oldWallet } = req.body;

    // 钱包已存在，必须验证旧地址
    if (userWallet && oldWallet && oldWallet !== userWallet) {
        return res.json({ success: false, error: "Old wallet mismatch" });
    }

    userWallet = wallet;

    res.json({ success: true, wallet });
});

// ⭐ 3) 提现
app.post("/api/withdraw", (req, res) => {
    const { coin, amount, usdt, wallet, hash } = req.body;

    if (!wallet) {
        return res.json({ success: false, error: "Wallet not bound" });
    }

    console.log("Withdrawal request received:", {
        coin, amount, usdt, wallet, hash
    });

    res.json({ success: true, hash });
});

// ----------- 静态文件托管（前端） --------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// 兜底路由（SPA 必须）
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Railway 端口
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
