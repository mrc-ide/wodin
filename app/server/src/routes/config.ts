import { ConfigController } from "../controllers/configController";
import { Router } from "express";

const router = Router();
router.get("/:appName", ConfigController.getConfig);

export default router;
