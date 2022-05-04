import { ConfigController } from "../controllers/configController";

const router = require("express").Router();

router.get("/:appName", ConfigController.getConfig);

module.exports = router;
