import { Request, Response } from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinRunner } from "../exampleOdin/exampleOdinRunner";
import { Controller } from "./controller";

export class OdinController extends Controller {
    static getRunner = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinRunner);
    };

    static getModel = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinModel);
    };
}
