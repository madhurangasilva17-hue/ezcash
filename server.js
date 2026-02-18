const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = "8487781878:AAEkWf8teIZfuTXQW6oLfWIYza_pyjSLS7w"; // ← BotFather token
const WEBAPP_URL = "https://madhurangasilva17-hue.github.io/ezcash/?v=20";

const bot = new TelegramBot(TOKEN, { polling: true });

let users = {};

// BOT START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to EzCash 💰", {
    reply_markup: {
      inline_keyboard: [[
        { text: "Open EzCash", web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

// GET USER
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  if (!users[userId]) {
    users[userId] = { balance: 0, ads: 0, referrals: 0 };
  }

  res.json(users[userId]);
});

// ADSGRAM REWARD CALLBACK
app.get("/reward", (req, res) => {
  const userId = req.query.userid;

  if (!users[userId]) {
    users[userId] = { balance: 0, ads: 0, referrals: 0 };
  }

  users[userId].balance += 100;
  users[userId].ads += 1;

  console.log("Reward added:", userId);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
