import { ErrorType } from "./errorType";

export class WodinError extends Error {
    status: number;

    errorType: ErrorType;

    constructor(message: string, status: number, errorType: ErrorType) {
        super(message);

        this.name = "WodinError";
        this.status = status;
        this.errorType = errorType;
    }
}
