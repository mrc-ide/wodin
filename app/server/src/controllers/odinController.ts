import { Application, Request, Response } from "express";
import { exampleOdinModel } from "../exampleOdin/exampleOdinModel";
import { exampleOdinUtils } from "../exampleOdin/exampleOdinUtils";
import axios from "axios";

export class OdinController {
    private readonly _path = "/odin";

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/utils`, OdinController.getUtils);
        app.post(`${this._path}/model`, OdinController.postModel);
    };

    private static addHeader = (res: Response) => {
        res.header("Content-Type", "application/javascript");
    };

    static getUtils = (req: Request, res: Response) => {
        OdinController.addHeader(res);
        res.end(exampleOdinUtils);
    };

    static postModel = async (req: Request, res: Response) => {

        console.log("Making request with:")
        console.log(JSON.stringify(req.body))

        const hackBody = `{"model": [
        "deriv(y1) <- sigma * (y2 - y1)",
        "deriv(y2) <- R * y1 - y2 - y1 * y3",
        "deriv(y3) <- -b * y3 + y1 * y2",
        "initial(y1) <- 10.0",
        "initial(y2) <- 1.0",
        "initial(y3) <- 1.0",
        "sigma <- 10.0",
        "R     <- 28.0",
        "b     <-  8.0 / 3.0"
    ]}`;

        axios.post("http://localhost:8001/compile", JSON.parse(hackBody), {headers: {'Content-Type': 'application/json'}})
            .then((apiResponse) => {
                console.log("got response")
                console.log(JSON.stringify(apiResponse.data)) //TODO: return full response and edal with it in front end
                OdinController.addHeader(res)

                console.log("RETURNING MODEL:")
                console.log(JSON.stringify(apiResponse.data))

                res.end(apiResponse.data.data.model);
            })
            .catch((errorResponse) => {
                console.log("error");
                console.log(JSON.stringify(errorResponse))
                res.end(errorResponse.body)
            });

    };
}
