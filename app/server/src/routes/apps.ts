import { AppsController } from "../controllers/appsController";

const router = require("express").Router();

router.get("/:appName", AppsController.getApp);

export default router;
