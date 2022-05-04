import { Application, Request, Response } from "express";
import { IndexController } from "../controllers/indexController";

module.exports = (app: Application) => {
    const router = require("express").Router();

    router.get("/", IndexController.getIndex);
    router.use("/odin", require("./odin"));
    router.use("/config", require("./config"));
    router.use(`/${app.locals.appsPath}`, require("./apps"));

    router.use((req: Request, res: Response) => {
        const { url } = req;
        res.status(404).render("page-not-found", { url });
    });

    return router;
};
