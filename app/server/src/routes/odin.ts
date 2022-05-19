import { OdinController } from "../controllers/odinController";

const router = require("express").Router();

router.get("/runner", OdinController.getRunner);
router.post("/model", OdinController.postModel);

export default router;
