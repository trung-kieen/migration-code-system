import { Request, Response } from "express";

export function getCount(req: Request, res: Response) {
  try {
    const n = parseInt(req.params.n);
    const LIMIT = 10000; // Giới hạn số lượng

    // KIỂM TRA: Nếu n lớn hơn LIMIT thì báo lỗi ngay
    if (isNaN(n) || n < 0 || n > LIMIT) {
      return res.status(400).json({
        error: `'n' must be a positive integer between 0 and ${LIMIT}`,
      });
    }

    const result = `
function printCountToN(n) {
  if (!Number.isInteger(n) || n < 0 || n > ${LIMIT}) {
    throw new Error("N must be an integer between 0 and ${LIMIT}");
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