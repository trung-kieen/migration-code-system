import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;
const SERVER_ID = process.env.SERVER_ID || 'unknown';
const VERSION = '1.0.0';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  console.log(`[${SERVER_ID}] Health check`);
  res.json({ status: 'ok', server: SERVER_ID, version: VERSION });
});

// Count endpoint
app.get('/nau/:n', (req: Request, res: Response) => {
  const n = parseInt(req.params.n, 10);
  const clientVersion = req.query.client_version as string;

  console.log(`[${SERVER_ID}] GET /nau/${n} (Client v: ${clientVersion || 'none'}, Server v: ${VERSION})`);

  if (isNaN(n) || n < 0) {
    return res.status(400).json({ error: 'n must be >= 0' });
  }

  const call = `printCountToN(${n});`;

  // Version check
  if (clientVersion === VERSION) {
    console.log(`[${SERVER_ID}] ✅ Cache hit (v${VERSION})`);
    return res.json({ 
      call, 
      version: VERSION, 
      server: SERVER_ID,
      cached: true 
    });
  }

  const code = `function printCountToN(n) { for (let i = 0; i <= n; i++) console.log(i); }`;

  console.log(`[${SERVER_ID}] 🚀 Sending new code (v${VERSION})`);
  res.json({ 
    code, 
    call, 
    version: VERSION, 
    server: SERVER_ID,
    cached: false
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Nau Server (${SERVER_ID}) on port ${PORT}`);
});
