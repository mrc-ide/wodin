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
    name: string;
    displayName: string;
    displayNameErrorMsg: string;
    parameterValues: OdinUserType;
    hidden: boolean;
}

export enum AdvancedComponentType {
    num = "numeric",
    stdf = "standard form",
    tag = "tag input"
}

type AdvancedConfigStandardForm = {
    val: [number | null, number | null];
    default: [number, number];
    type: AdvancedComponentType.stdf;
};

type AdvancedConfigNumeric = {
    val: number | null;
    default?: number;
    type: AdvancedComponentType.num;
};

export type Tag = number | string;

type AdvancedConfigTCrit = {
    val: Tag[] | null;
    default: number[];
    type: AdvancedComponentType.tag;
};

export type AdvancedConfig = AdvancedConfigNumeric | AdvancedConfigStandardForm | AdvancedConfigTCrit;

export type AdvancedSettings = Record<AdvancedOptions, AdvancedConfig>;

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
    showUnchangedParameters: boolean;
    parameterSetResults: Dict<OdinRunResultOde>;
    advancedSettings: AdvancedSettings;
}
