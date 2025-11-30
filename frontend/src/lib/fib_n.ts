import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { n } = req.query;

  try {
    const response = await axios.get(`http://localhost:8080/fib/${n}`);
    res.status(response.status).json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
}
