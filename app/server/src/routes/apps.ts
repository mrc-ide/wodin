import { AppsController } from "../controllers/appsController";
import { SessionsController } from "../controllers/sessionsController";

const router = require("express").Router();
const bodyParser = require("body-parser");

// Support optional '/sessions' part in apps route to allow refresh of sessions page in front end
router.get(["/:appName", "/:appName/sessions"], AppsController.getApp);

// Parse the posted JSON as text since all we are going to do with it is to save it to redis
router.post("/:appName/sessions/:id", bodyParser.text({ type: "application/json" }), SessionsController.postSession);
router.get("/:appName/sessions/metadata", SessionsController.getSessionsMetadata);
router.post(
    "/:appName/sessions/:id/label",
    bodyParser.text(),
    SessionsController.postSessionLabel
);

export default router;
