import { Application, Request, Response } from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinUtils } from "../exampleOdin/exampleOdinUtils";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/utils`, OdinController.getUtils);
        app.get(`${this._path}/model`, OdinController.getModel);
    };

    private static addHeader = (res: Response) => {
        res.header("Content-Type", "application/javascript");
    };

    static getUtils = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinUtils);
    };

    static getModel = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinModel);
    };
}
