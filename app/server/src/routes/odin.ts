import { OdinController } from "../controllers/odinController";

const router = require("express").Router();
const bodyParser = require("body-parser");

// TODO: rename /runner
router.get("/runner/ode", OdinController.getRunnerOde);
router.post("/model", bodyParser.json(), OdinController.postModel);
router.get("/versions", OdinController.getVersions);

export default router;
