import { OdinController } from "../controllers/odinController";
import { Router } from "express";
import { json } from "body-parser";

const router = Router();

router.get("/runner/ode", OdinController.getRunnerOde);
router.get("/runner/discrete", OdinController.getRunnerDiscrete);
router.post("/model", json(), OdinController.postModel);
router.get("/versions", OdinController.getVersions);

export default router;
