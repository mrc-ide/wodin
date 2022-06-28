import { ErrorType } from "./errorType";
import { WodinError } from "./wodinError";

export class WodinWebError extends WodinError {
    view: string;

    options: object;

    constructor(message: string, status: number, errorType: ErrorType, view: string, options: object) {
        super(message, status, errorType);

        this.name = "WodinWebError";
        this.view = view;
        this.options = options;
    }
}
