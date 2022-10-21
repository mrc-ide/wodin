import { Request, Response } from "express";
import { api } from "../apiService";

export class OdinController {
    static getRunnerOde = async (req: Request, res: Response, next: Function) => {
        await api(req, res, next)
            .get("/support/runner-ode");
    };

    static postModel = async (req: Request, res: Response, next: Function) => {
        await api(req, res, next)
            .post("/compile", req.body);
    };

    static getVersions = async (req: Request, res: Response, next: Function) => {
        await api(req, res, next)
            .get("/");
    };
}
