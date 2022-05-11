import { Request, Response } from "express";
import { APIService } from "../apiService";

export class OdinController {
    static getRunner = async (req: Request, res: Response) => {
        await APIService.get("/support/runner-ode", req, res);
    };

    static postModel = async (req: Request, res: Response) => {
        await APIService.post("/compile", req.body, req, res);
    };
}
