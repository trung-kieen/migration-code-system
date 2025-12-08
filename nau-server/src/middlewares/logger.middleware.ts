import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  console.log("----- NEW REQUEST -----");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("IP:", req.ip);
  console.log("User-Agent:", req.headers["user-agent"]);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  console.log("Body:", req.body);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Status: ${res.statusCode}`);
    console.log(`Execution Time: ${duration}ms`);
    console.log("------------------------");
  });

  next();
}
