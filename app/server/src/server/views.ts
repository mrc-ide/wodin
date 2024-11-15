import { Application } from "express";
import { render } from "mustache";
import fs from "fs";
import path from "path";

export const registerViews = (app: Application, rootDir: string) => {
    app.engine("mustache", (filePath, options, callback) => {
        try {
            const mustacheTemplate = fs.readFileSync(filePath).toString();
            return callback(null, render(mustacheTemplate, options));
        } catch (err) {
            return callback(err);
        }
    });
    app.set("view engine", "mustache");
    app.set("views", path.join(rootDir, "views"));
};
