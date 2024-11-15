import { AppsController } from "../controllers/appsController";
import { SessionsController } from "../controllers/sessionsController";
import { Router } from "express";
import { text } from "body-parser";

const router = Router();

// Support optional '/sessions' part in apps route to allow refresh of sessions page in front end
router.get(["/:appName", "/:appName/sessions"], AppsController.getApp);

// Parse the posted JSON as text since all we are going to do with it is to save it to redis
router.post("/:appName/sessions/:id", text({ type: "application/json" }), SessionsController.postSession);
router.get("/:appName/sessions/metadata", SessionsController.getSessionsMetadata);
router.post(
    "/:appName/sessions/:id/label",
    text(),
    SessionsController.postSessionLabel
);
router.get("/:appName/sessions/:id", SessionsController.getSession);
router.post("/:appName/sessions/:id/friendly", SessionsController.generateFriendlyId);

export default router;
