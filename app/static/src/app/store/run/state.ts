import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResult } from "../../types/wrapperTypes";

export interface RunUpdateRequiredReasons {
    modelChanged: boolean;
    parameterValueChanged: boolean;
    endTimeChanged: boolean;
}

export interface RunState {
    // Contains reasons why the run miht be out of date
    runRequired: RunUpdateRequiredReasons;
    // Parameter values to pass into the next solution
    parameterValues: null | OdinUserType;
    // End time for the next solution
    endTime: number;
    // The result of running the model, along with its inputs
    result: OdinRunResult | null;
    userDownloadFileName: string;
    downloading: boolean;
    numberOfReplicates: number;
}
