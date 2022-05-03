import { Response } from "express";

export class Controller {
    protected static addHeader = (res: Response) => {
        res.header("Content-Type", "application/javascript");
    };
}
