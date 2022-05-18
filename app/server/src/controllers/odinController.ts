import { Request, Response } from "express";
import { APIService } from "../apiService";

export class OdinController {
    static getRunner = async (req: Request, res: Response) => {
        await new APIService(req, res)
            .get("/support/runner-ode");
    };

    static postModel = async (req: Request, res: Response) => {
        await new APIService(req, res)
            .post("/compile", req.body);
    };
}
