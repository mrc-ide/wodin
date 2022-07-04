import { Dict } from "./types/utilTypes";
import { Error } from "./types/responseTypes";
import userMessages from "./userMessages";

export const freezer = {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    deepFreeze: (data: unknown): unknown => {
        if (Array.isArray(data)) {
            return Object.freeze(data.map((d) => freezer.deepFreeze(d)));
        }
        if (data != null && typeof data === "object") {
            const anyData = data as any;
            Object.keys(data).forEach((prop) => {
                anyData[prop] = freezer.deepFreeze(anyData[prop]);
            });
            return Object.freeze(data);
        }
        return data;
    }
};

/* eslint-disable no-eval */
export function evaluateScript<T>(script: string): T {
    return eval(script) as T;
}

export interface ProcessFitDataResult {
    data: Dict<number>[] | null;
    error: Error | null;
}
export function processFitData(data: Dict<string>[], errorMsg: string): ProcessFitDataResult {
    if (!data.length) {
        return { data: null, error: { error: errorMsg, detail: userMessages.fitData.noRows } };
    }
    const nonNumValues: string[] = [];
    const processedData = data.map((row) => {
        const processedRow: Dict<number> = {};
        Object.keys(row).forEach((key) => {
            const value = Number(row[key]);
            if (Number.isNaN(value)) {
                nonNumValues.push(row[key]);
            } else {
                processedRow[key] = value;
            }
        });
        return processedRow;
    });
    if (nonNumValues.length) {
        // There might be many non-numeric values, just return the first few in the error
        const valueCount = Math.max(3, nonNumValues.length);
        const suffix = nonNumValues.length > valueCount ? " and more" : "";
        const detail = `${userMessages.fitData.nonNumericValues}: ${nonNumValues.slice(0, valueCount).join(", ")}${suffix}`;
        const error = { error: errorMsg, detail };
        return { data: null, error };
    }
    return { data: processedData, error: null };
}
