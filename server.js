const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = {};

// Get user data
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  if (!users[userId]) {
    users[userId] = { balance: 0, ads: 0, referrals: 0 };
  }

  res.json(users[userId]);
});

// AdsGram Reward Callback
app.get("/reward", (req, res) => {
  const userId = req.query.userid; // MUST match AdsGram

  if (!userId) {
    return res.status(400).json({ error: "No userId" });
  }

  if (!users[userId]) {
    users[userId] = { balance: 0, ads: 0, referrals: 0 };
  }

  users[userId].balance += 100;
  users[userId].ads += 1;

  console.log("Reward added to:", userId);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
