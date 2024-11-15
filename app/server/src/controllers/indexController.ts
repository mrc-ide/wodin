import { Request, Response } from "express";
import { AppLocals } from "../types";
import path from "path";

export class IndexController {
    static getIndex = (req: Request, res: Response) => {
        const { configPath } = req.app.locals as AppLocals;
        const filename = path.join(configPath, "index.html");
        res.sendFile(filename);
    };
}
