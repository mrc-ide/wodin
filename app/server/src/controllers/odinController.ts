import {Application, Request, Response} from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinUtils } from "../exampleOdin/exampleOdinUtils";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/utils`, this.getUtils),
        app.get(`${this._path}/model`, this.getModel);
    };

    getUtils = (req: Request, res: Response) => {
        res.end(exampleOdinUtils);
    };

    getModel = (req: Request, res: Response) => {
        res.end(exampleOdinModel)
    };
}
