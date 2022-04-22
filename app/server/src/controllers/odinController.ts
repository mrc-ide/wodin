import { Application, Request, Response } from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinRunner } from "../exampleOdin/exampleOdinRunner";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/runner`, OdinController.getRunner);
        app.get(`${this._path}/model`, OdinController.getModel);
    };

    private static addHeader = (res: Response) => {
        res.header("Content-Type", "application/javascript");
    };

    static getRunner = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinRunner);
    };

    static getModel = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinModel);
    };
}
