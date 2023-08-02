import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResultOde, OdinRunResultDiscrete } from "../../types/wrapperTypes";
import { Dict } from "../../types/utilTypes";

export interface RunUpdateRequiredReasons {
    modelChanged: boolean;
    parameterValueChanged: boolean;
    endTimeChanged: boolean;
    numberOfReplicatesChanged: boolean;
    advancedSettingsChanged: boolean;
}

export interface ParameterSet {
    name: string,
    parameterValues: OdinUserType,
    hidden: boolean
}

export enum AdvancedOptions {
    "tol" = "Tolerance",
    "maxSteps" = "Max Steps",
    "stepSizeMax" = "Max Step Size",
    "stepSizeMin" = "Min Step Size",
    "tcrit" = "Critical Time"
}

type AdConfStandardForm = {
    val: (number | null)[],
    defaults: number[],
    standardForm: true
}

type AdConfNumeric = {
    val: number | null,
    defaults: number,
    standardForm: false
}

export type AdvancedConfig = AdConfNumeric | AdConfStandardForm

export type AdvancedSettings = Record<AdvancedOptions, AdvancedConfig>

export type AdvancedSettingsOdin = {
    atol: number | null,
    rtol: number | null,
    maxSteps: number | null,
    stepSizeMax: number | null,
    stepSizeMin: number | null,
    tcrit: number | null
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
    numberOfReplicates: number;
    // counter of how many parmeter sets have been created in this session, including those subsequently deleted
    parameterSetsCreated: number;
    parameterSets: ParameterSet[];
    parameterSetResults: Dict<OdinRunResultOde>;
    advancedSettings: AdvancedSettings;
}
