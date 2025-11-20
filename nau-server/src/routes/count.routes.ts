import { Router } from "express";
import { getCount } from "../controllers/count.controller";

const router = Router();

router.get("/:n", getCount);

export default router;
