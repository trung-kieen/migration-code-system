import { getCount } from "../controllers/count.controller";
import { Router } from "express";

const router = Router();

router.get("/:n", getCount);

export default router;
