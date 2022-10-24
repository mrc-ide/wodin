import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResultOde, OdinRunResultDiscrete } from "../../types/wrapperTypes";

export interface RunUpdateRequiredReasons {
    modelChanged: boolean;
    parameterValueChanged: boolean;
    endTimeChanged: boolean;
}

export interface RunState {
    // Contains reasons why the run might be out of date
    runRequired: RunUpdateRequiredReasons;
    // Parameter values to pass into the next solution
    parameterValues: null | OdinUserType;
    // End time for the next solution
    endTime: number;
    // The result of running an ODE model, along with its inputs
    resultOde: OdinRunResultOde | null;
    // The result of running a discrete model
    resultDiscrete: OdinRunResultDiscrete | null;
    userDownloadFileName: string;
    downloading: boolean;
}
