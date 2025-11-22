
import express from 'express';
import Redis from 'ioredis';
const app=express();
app.use(express.json());
const r=new Redis(process.env.REDIS_URL);
app.post('/save-phone',async (req,res)=>{ await r.hmset('last',{phone:req.body.phone}); res.json({ok:true});});
app.post('/save-password',async (req,res)=>{ await r.hset('last','password',req.body.password); res.json({ok:true});});
app.get('/records',async(req,res)=>{ const x=await r.hgetall('last'); res.json([x]);});
app.listen(3000);

