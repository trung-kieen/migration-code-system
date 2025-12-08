import express from "express";
import countRoutes from "./routes/count.routes";
import { logger } from "./middlewares/logger.middleware";
const app = express();
app.use(express.json());
app.use(logger);
app.use("/nau", countRoutes);
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server start by http://localhost:${PORT}`);
});
