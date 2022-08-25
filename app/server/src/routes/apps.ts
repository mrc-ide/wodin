import { AppsController } from "../controllers/appsController";
import { SessionsController } from "../controllers/sessionsController";

const router = require("express").Router();

router.get("/:appName", AppsController.getApp);
router.post("/:appName/sessions/:id", SessionsController.postSession);

export default router;
