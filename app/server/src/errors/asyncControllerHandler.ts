// This method should be used to wrap any async controller methods to ensure error handling is applied
// (not required for controller methods which only use apiService, which already handles errors)
import { NextFunction } from "express";

export default async (next: Function, method: NextFunction) => {
    try {
        await method();
    } catch (error) {
        next(error);
    }
};
