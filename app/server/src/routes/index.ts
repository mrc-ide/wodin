import { Application, Request } from "express";
import { IndexController } from "../controllers/indexController";
import appsRoutes from "./apps";
import odinRoutes from "./odin";
import configRoutes from "./config";
import { ErrorType } from "../errors/errorType";
import { WodinWebError } from "../errors/wodinWebError";

const express = require("express");

export const registerRoutes = (app: Application) => {
    const router = express.Router();

    router.get("/", IndexController.getIndex);
    router.use("/odin", odinRoutes);
    router.use("/config", configRoutes);
    router.use(`/${app.locals.appsPath}`, appsRoutes);

    router.use((req: Request) => {
        const { url } = req;
        throw new WodinWebError(`Page not found: ${url}`, 404, ErrorType.NOT_FOUND, "page-not-found", { url });
    });

    return router;
};
