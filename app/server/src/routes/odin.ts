import { OdinController } from "../controllers/odinController";

const router = require("express").Router();
const bodyParser = require("body-parser");

router.get("/runner", OdinController.getRunner);
router.post("/model", bodyParser.json(), OdinController.postModel);
router.get("/versions", OdinController.getVersions);

export default router;
