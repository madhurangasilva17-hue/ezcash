const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "8487781878:AAHigtDiMF51fE4gm6fuu6tMzXxKNEzV8OI";
const WEBAPP_URL = "https://madhurangasilva17-hue.github.io/ezcash/";

const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(cors());
app.use(express.json());

let users = {};

/* ===== USER HELPER ===== */
function ensureUser(id){
  if(!users[id]){
    users[id] = {
      balance: 0,
      referrals: 0,
      referredBy: null,
      ads: 0
    };
  }
}

/* ===== START WITH REFERRAL ===== */
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
console.log("Start Param:", match[1]);

  const userId = msg.from.id;
  const refId = match[1];

  ensureUser(userId);

  // If first time join
  if(!users[userId].referredBy && refId && refId != userId){

    if(users[refId]){

      users[userId].referredBy = refId;

      // Bonus to new user
      users[userId].balance += 150;

      // Bonus to referrer
      users[refId].balance += 200;
      users[refId].referrals += 1;
    }
  }

  bot.sendMessage(msg.chat.id, "Welcome to EzCash 💰", {
    reply_markup: {
      inline_keyboard: [[
        { text: "Open EzCash", web_app: { url: WEBAPP_URL } }
      ]]
    }
  });

});

/* ===== GET USER ===== */
app.get("/user/:id", (req,res)=>{
  const id = req.params.id;
  ensureUser(id);
  res.json(users[id]);
});

/* ===== WATCH AD ===== */
app.post("/watch-ad", (req,res)=>{
  const { userId } = req.body;

  ensureUser(userId);

  if(users[userId].ads >= 30){
    return res.json(users[userId]);
  }

  users[userId].balance += 100;
  users[userId].ads += 1;

  res.json(users[userId]);
});

/* ===== WITHDRAW ===== */
app.post("/withdraw", (req,res)=>{
  const { userId, amount } = req.body;

  ensureUser(userId);

  if(users[userId].balance < amount){
    return res.json({ ok:false, error:"Insufficient balance" });
  }

  if(users[userId].referrals < 15){
    return res.json({ ok:false, error:"Need 15 referrals" });
  }

  users[userId].balance -= amount;

  res.json({ ok:true, balance: users[userId].balance });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
