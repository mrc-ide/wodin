import { AdvancedOptions, OdinUserType } from "../../types/responseTypes";
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

export enum AdSettingCompType {
    num = "numeric",
    stdf = "standard form",
    tag = "tag input"
}

type AdConfStandardForm = {
    val: [number|null, number|null],
    defaults: number[],
    type: AdSettingCompType.stdf
}

type AdConfNumeric = {
    val: number | null,
    defaults: number,
    type: AdSettingCompType.num
}

export type Tag = number | string

type AdConfTCrit = {
    val: Tag[] | null,
    defaults: number[],
    type: AdSettingCompType.tag
}

export type AdvancedConfig = AdConfNumeric | AdConfStandardForm | AdConfTCrit

export type AdvancedSettings = Record<AdvancedOptions, AdvancedConfig>

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
