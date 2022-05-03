import { ConfigController } from "../controllers/configController";
import {ConfigReader} from "../configReader";

const express = require("express");

const app = express();
const router = express.Router();

console.log("CONFIG PATH: "  + app.get("configPath")); //THIS ISN'T GETTING PICKED UP -  NOT USED?
console.log("APPS LOCAL TEST:" + app.locals.testy)

const configReader = new ConfigReader(app.get("configPath"));
const configController = new ConfigController(configReader, app.get("appsPath"));

app.use("config", router);
router.get(`/:appName`, configController.getConfig);
module.exports = router;
