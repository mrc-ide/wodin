import { OdinController } from "../controllers/odinController";

const router = require("express").Router();

router.get("/runner", OdinController.getRunner);
router.get("/model", OdinController.getModel);

module.exports = router;
