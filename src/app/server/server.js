const express = require("express");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use("/files", express.static("config/files"));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

const getAppConfig = (appName) => {
    const filename = path.join(__dirname, `config/${appName}.config.json`);
    // TODO: error handling - return 404 if file not found
    const configText = fs.readFileSync(filename, {encoding: "utf-8"});
    return JSON.parse(configText);
};

app.get("/", (req, res) => {
    const options = {
        root: path.join(__dirname, "config")
    };
    res.sendFile("index.html", options);
});

app.get("/apps/:appName", (req, res) => {
    const appName = req.params.appName;
    const config = getAppConfig(appName);
    res.render("app", {config});
});

app.listen(port, () => {
    console.log(`wodin server listening on port ${port}`)
});
