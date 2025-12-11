import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;
const SERVER_ID = process.env.SERVER_ID || 'unknown';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  console.log(`[${SERVER_ID}] Health check`);
  res.json({ status: 'ok', server: SERVER_ID });
});

// Count endpoint
app.get('/nau/:n', (req: Request, res: Response) => {
  const n = parseInt(req.params.n, 10);
  console.log(`[${SERVER_ID}] GET /nau/${n}`);

  if (isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'n must be >= 0' });
  }

  const code = `function printCountToN(n) { for (let i = 0; i <= n; i++) console.log(i); }`;
  const call = `printCountToN(${n});`;

  console.log(`[${SERVER_ID}] ✅ Responded`);
  res.json({ code, call, server: SERVER_ID });
});

app.listen(PORT, () => {
  console.log(`🚀 Nau Server (${SERVER_ID}) on port ${PORT}`);
});
