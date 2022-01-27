const express = require("express");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");

const app = express();
const port = 3000;
const rootDir = path.join(__dirname, "..");

app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(rootDir, "config/files")));

app.set("view engine", "hbs");
app.set("views", path.join(rootDir, "views"));

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

const getAppConfig = (appName) => {
    const filename = path.join(rootDir, "config",  `${appName}.config.json`);
    // TODO: error handling - return 404 if file not found
    if (fs.existsSync(filename)) {
        const configText = fs.readFileSync(filename, {encoding: "utf-8"});
        return JSON.parse(configText);
    }
    return null;
};

app.get("/", (req, res) => {
    const filename = path.join(rootDir, "config", "index.html");
    res.sendFile(filename);
});

app.get("/apps/:appName", (req, res) => {
    const appName = req.params["appName"];
    const config = getAppConfig(appName);
    if (config) {
        res.render("app", {config});
    } else {
        req.status(404);
    }
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`)
});
