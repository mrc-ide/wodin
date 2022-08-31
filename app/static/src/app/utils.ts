import { uid } from "uid";
import { Dict } from "./types/utilTypes";
import { BatchPars, OdinModelResponseError, WodinError } from "./types/responseTypes";
import userMessages from "./userMessages";
import settings from "./settings";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "./store/sensitivity/state";
import { AppState } from "./store/appState/state";

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
    columns: string[] | null,
    timeVariableCandidates: string[] | null,
    error?: WodinError
}

export function getCodeErrorFromResponse(errorResponse: OdinModelResponseError): WodinError {
    const line = errorResponse.line.join();
    const lineWord = errorResponse.line.length > 1 ? "lines" : "line";
    const detail = line ? `Error on ${lineWord} ${line}: ${errorResponse.message}` : errorResponse.message;
    const error = "Code error";
    return { error, detail };
}

export function processFitData(data: Dict<string>[], errorMsg: string): ProcessFitDataResult {
    const emptyResult = {
        data: null, columns: null, timeVariableCandidates: null
    };
    if (Object.keys(data[0]).length < settings.minFitDataColumns) {
        return { ...emptyResult, error: { error: errorMsg, detail: userMessages.fitData.tooFewColumns } };
    }

    // Convert the string values in the file data into numbers. Keep any values which cannot be converted in
    // nonNumValues and, if any, return the first few in an error message
    const nonNumValues: string[] = [];

    const processedData = data.map((row) => {
        const processedRow: Dict<number> = {};
        Object.keys(row).forEach((key) => {
            const value = Number(row[key]);
            if (row[key] === "" || row[key] === "NA") {
                processedRow[key] = NaN;
            } else if (Number.isNaN(value)) {
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

    // There might be trailing empty rows to drop.
    while (processedData.length > 0) {
        const row = processedData[processedData.length - 1];
        if (Object.values(row).every((v) => Number.isNaN(v))) { // all missing
            processedData.pop();
        } else {
            break;
        }
    }

    // Only after discarding missing blank rows should we check to see if we have sufficient
    if (processedData.length < settings.minFitDataRows) {
        return { ...emptyResult, error: { error: errorMsg, detail: userMessages.fitData.tooFewRows } };
    }

    let timeVariableCandidates = Object.keys(data[0]);

    processedData.forEach((row, index) => {
        if (index > 0) {
            const toRemove: string[] = [];
            timeVariableCandidates.forEach((key) => {
                if (Number.isNaN(row[key]) || row[key] <= processedData[index - 1][key]) {
                    toRemove.push(key);
                }
            });
            timeVariableCandidates = timeVariableCandidates.filter((key) => !toRemove.includes(key));
        }
    });

    if (!timeVariableCandidates.length) {
        return { ...emptyResult, error: { error: errorMsg, detail: userMessages.fitData.noTimeVariables } };
    }

    const columns = Object.keys(processedData[0]);
    return {
        ...emptyResult, data: processedData, columns, timeVariableCandidates
    };
}

export interface GenerateBatchParsResult {
    batchPars: BatchPars | null,
    error: WodinError | null
}

export function generateBatchPars(
    rootState: AppState,
    paramSettings: SensitivityParameterSettings
): GenerateBatchParsResult {
    let batchPars = null;
    let errorDetail = null;
    const runner = rootState.model.odinRunner;
    const paramValues = rootState.run.parameterValues;
    const {
        variationType, parameterToVary, numberOfRuns, variationPercentage, scaleType, rangeFrom, rangeTo
    } = paramSettings;
    const logarithmic = scaleType === SensitivityScaleType.Logarithmic;

    if (!parameterToVary) {
        errorDetail = "Parameter to vary is not set";
    } else if (!runner || !paramValues) {
        errorDetail = "Model is not initialised";
    } else if (variationType === SensitivityVariationType.Percentage) {
        try {
            batchPars = runner.batchParsDisplace(
                paramValues, parameterToVary,
                numberOfRuns, logarithmic,
                variationPercentage
            );
        } catch (e) {
            errorDetail = (e as Error).message;
        }
    } else {
        try {
            batchPars = runner.batchParsRange(
                paramValues,
                parameterToVary,
                numberOfRuns,
                logarithmic,
                rangeFrom,
                rangeTo
            );
        } catch (e) {
            errorDetail = (e as Error).message;
        }
    }

    const error = errorDetail ? { error: userMessages.sensitivity.invalidSettings, detail: errorDetail } : null;
    return {
        batchPars,
        error
    };
}

export const newSessionId = (): string => uid(32);

export const joinStringsSentence = (strings: string[], last = " and ", sep = ", "): string => {
    const n = strings.length;
    if (n === 0) {
        return "";
    } if (n === 1) {
        return strings[0];
    }
    return strings.slice(0, n - 1).join(sep) + last + strings[n - 1];
};

export const allTrue = (x: Dict<boolean>): boolean => {
    return Object.values(x).every((el: boolean) => el);
};

export const anyTrue = (x: Dict<boolean>): boolean => {
    return Object.values(x).some((el: boolean) => el);
};
