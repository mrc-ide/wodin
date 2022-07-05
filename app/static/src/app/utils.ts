import { Dict } from "./types/utilTypes";
import { Error } from "./types/responseTypes";
import userMessages from "./userMessages";
import settings from "./settings";

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
    timeVariableCandidates: string[] | null
}
export function processFitData(data: Dict<string>[], errorMsg: string): ProcessFitDataResult {
    const emptyResult = {
        data: null, timeVariableCandidates: null, error: null
    };
    if (data.length < settings.minFitDataRows) {
        return { ...emptyResult, error: { error: errorMsg, detail: userMessages.fitData.tooFewRows } };
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
        const valueCount = Math.min(settings.displayFitDataNonNumericValues, nonNumValues.length);
        const suffix = nonNumValues.length > valueCount ? " and more" : "";
        const msgValues = nonNumValues.slice(0, valueCount).map((s) => `'${s}'`).join(", ");
        const detail = `${userMessages.fitData.nonNumericValues}: ${msgValues}${suffix}`;
        const error = { error: errorMsg, detail };
        return { ...emptyResult, error };
    }
    let timeVariableCandidates = Object.keys(data[0]);

    processedData.forEach((row, index) => {
        if (index > 0) {
            const toRemove: string[] = [];
            timeVariableCandidates.forEach((key) => {
                if (row[key] <= processedData[index - 1][key]) {
                    toRemove.push(key);
                }
            });
            timeVariableCandidates = timeVariableCandidates.filter((key) => !toRemove.includes(key));
        }
    });

    if (!timeVariableCandidates.length) {
        return { ...emptyResult, error: { error: errorMsg, detail: userMessages.fitData.noTimeVariables } };
    }

    return { ...emptyResult, data: processedData, timeVariableCandidates };
}
