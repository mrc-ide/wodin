import { Request, Response } from "express";
import { APIService } from "../apiService";

export class OdinController {
    static getRunner = (req: Request, res: Response) => {
      // res.end(apiResponse.data.data);

        APIService.get("/support/runner-ode", req, res);

    };

    static postModel = (req: Request, res: Response) => {
        APIService.post("/compile", req.body, req, res);

       //res.end(apiResponse.data.data.model)
    };
}
