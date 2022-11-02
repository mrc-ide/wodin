import {NextFunction, Request, Response} from "express";
import { api } from "../apiService";

export class OdinController {
    static getRunnerOde = async (req: Request, res: Response, next: NextFunction) => {
        await api(req, res, next)
            .get("/support/runner-ode");
    };

    static getRunnerDiscrete = async (req: Request, res: Response, next: NextFunction) => {
        await api(req, res, next)
            .get("/support/runner-discrete");
    };

    static postModel = async (req: Request, res: Response, next: NextFunction) => {
        await api(req, res, next)
            .post("/compile", req.body);
    };

    static getVersions = async (req: Request, res: Response, next: NextFunction) => {
        await api(req, res, next)
            .get("/");
    };
}
