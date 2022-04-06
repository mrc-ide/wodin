import { Application, Request, Response } from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinUtils } from "../exampleOdin/exampleOdinUtils";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/utils`, OdinController.getUtils);
        app.get(`${this._path}/model`, OdinController.getModel);
    };

    static getUtils = (req: Request, res: Response) => {
        res.end(exampleOdinUtils);
    };

    static getModel = (req: Request, res: Response) => {
        res.end(exampleOdinModel);
    };
}
