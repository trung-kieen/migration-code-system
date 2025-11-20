import { Request, Response } from "express";

export function getCount(req: Request, res: Response) {
  try {
    const n = parseInt(req.params.n);

    if (isNaN(n) || n < 0) {
      return res.status(400).json({
        error: "'n' must be a positive integer",
      });
    }

    const result = `
function printCountToN(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("N must be an integer >= 0");
  }

  for (let i = 0; i <= n; i++) {
    console.log(i);
  }
}
`;

    const call = `printCountToN(${n});`;

    return res.status(200).json({
      code: result,
      call: call,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
