import { Application, Request, Response } from "express";
import { IndexController } from "../controllers/indexController";
import appsRoutes from "./apps";
import odinRoutes from "./odin";
import configRoutes from "./config";

const express = require("express");

export const registerRoutes = (app: Application) => {
    const router = express.Router();

    router.get("/", IndexController.getIndex);
    router.use("/odin", odinRoutes);
    router.use("/config", configRoutes);
    router.use(`/${app.locals.appsPath}`, appsRoutes);

    router.use((req: Request, res: Response) => {
        const { url } = req;
        res.status(404).render("page-not-found", { url });
    });

    return router;
};
