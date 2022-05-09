import { ConfigController } from "../controllers/configController";

const router = require("express").Router();

router.get("/:appName", ConfigController.getConfig);

export default router;
