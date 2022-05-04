import { Application } from "express";

const hbs = require("hbs");
const path = require("path");

module.exports = (app: Application, rootDir: string) => {
    app.set("view engine", "hbs");
    app.set("views", path.join(rootDir, "views"));

    hbs.registerHelper("json", (context: any) => {
        return JSON.stringify(context);
    });
};
