import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// 保留数据（你可以改成数据库）
let userWallet = null;

// ⭐ 1) 获取钱包地址
app.get("/api/wallet", (req, res) => {
    res.json({ wallet: userWallet });
});

// ⭐ 2) 绑定/修改钱包地址
app.post("/api/wallet", (req, res) => {
    const { wallet, oldWallet } = req.body;

    if (userWallet && oldWallet && oldWallet !== userWallet) {
        return res.json({ success: false, error: "Old wallet mismatch" });
    }

    userWallet = wallet;
    res.json({ success: true, wallet: userWallet });
});

// ⭐ 3) 提现 API
app.post("/api/withdraw", (req, res) => {
    const { coin, amount, usdt, wallet, hash } = req.body;

    if (!wallet) {
        return res.json({ success: false, error: "No wallet bound" });
    }

    // 你可以在这里做机器人通知等逻辑
    console.log("Withdraw request:", { coin, amount, usdt, wallet, hash });

    res.json({ success: true, hash });
});

// ⭐ 4) 静态文件托管（前端）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// ⭐ 5) 兜底：所有不属于 /api/* 的路由返回 index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ⭐ 6) Railway 端口
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running on port " + PORT));
