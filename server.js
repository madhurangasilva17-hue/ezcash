const express = require("express");
const cors = require("cors");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = "PUT_YOUR_BOT_TOKEN_HERE";
const WEBAPP_URL = "https://madhurangasilva17-hue.github.io/ezcash/?v=200";

const bot = new TelegramBot(TOKEN, { polling: true });

const DB_FILE = "./database.json";

// ---------------- DATABASE ----------------

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------------- TELEGRAM START ----------------

bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const refId = match[1]?.trim();

  const db = loadDB();

  if (!db.users[chatId]) {
    db.users[chatId] = {
      balance: 0,
      ads: 0,
      referrals: 0
    };

    // REFERRAL BONUS
    if (refId && refId !== String(chatId) && db.users[refId]) {
      db.users[refId].balance += 200;
      db.users[refId].referrals += 1;
      db.users[chatId].balance += 150;
    }

    saveDB(db);
  }

  bot.sendMessage(chatId, "Welcome to EzCash 💰", {
    reply_markup: {
      inline_keyboard: [[
        { text: "Open EzCash", web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

// ---------------- GET USER ----------------

app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { balance: 0, ads: 0, referrals: 0 };
    saveDB(db);
  }

  res.json(db.users[userId]);
});

// ---------------- REWARD ----------------

app.get("/reward", (req, res) => {
  const userId = req.query.userid;
  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { balance: 0, ads: 0, referrals: 0 };
  }

  db.users[userId].balance += 100;
  db.users[userId].ads += 1;

  saveDB(db);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
