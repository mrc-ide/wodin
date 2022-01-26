const express = require("express");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use("files", express.static("config/files"));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

const getPathConfig = (name) => {
    const filename = path.join(__dirname, `config${name}.config.json`);
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

app.get("*", (req, res) => {
    const url = req.url;
    console.log("Handling: " + url);

    const config = getPathConfig(url);
    res.render("app", {config});
});

app.listen(port, () => {
    console.log(`wodin server listening on port ${port}`)
});
