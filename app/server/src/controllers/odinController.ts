import { Request, Response } from "express";
import { api } from "../apiService";

export class OdinController {
    static getRunner = async (req: Request, res: Response, next: Function) => {
        await api(req, res, next)
            .get("/support/runner-ode");
    };

    static postModel = async (req: Request, res: Response, next: Function) => {
        await api(req, res, next)
            .post("/compile", req.body);
    };
}
