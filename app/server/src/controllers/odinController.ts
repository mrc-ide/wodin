import { Application, Request, Response } from "express";
import axios from "axios";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/runner`, OdinController.getRunner);
        app.post(`${this._path}/model`, OdinController.postModel);
    };

    private static addHeader = (res: Response) => {
        res.header("Content-Type", "application/javascript");
    };

    static getRunner = (req: Request, res: Response) => {
        axios.get("http://localhost:8001/support/runner-ode")
            .then((apiResponse) => {
                OdinController.addHeader(res);
                res.end(apiResponse.data.data);
            })
            .catch((errorResponse) => {
                res.end(errorResponse.body)
            });

    };

    static postModel = (req: Request, res: Response) => {

        console.log("Making request with:")
        console.log(JSON.stringify(req.body))

        axios.post("http://localhost:8001/compile", req.body, {headers: {'Content-Type': 'application/json'}})
            .then((apiResponse) => {
                OdinController.addHeader(res)
                res.end(apiResponse.data.data.model);
            })
            .catch((errorResponse) => {
                //TODO: generic error handling
                console.log("error");
                console.log(JSON.stringify(errorResponse))
                res.end(errorResponse.body)
            });

    };
}
