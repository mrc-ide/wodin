import { OdinSensitivityResult } from "../../types/wrapperTypes";
import { Dict } from "../../types/utilTypes";

export enum SensitivityScaleType {
    Arithmetic = "Arithmetic",
    Logarithmic = "Logarithmic"
}

export enum SensitivityVariationType {
    Percentage = "Percentage",
    Range = "Range",
    Custom = "Custom"
}

export interface SensitivityParameterSettings {
    parameterToVary: string | null,
    scaleType: SensitivityScaleType,
    variationType: SensitivityVariationType,
    variationPercentage: number,
    rangeFrom: number,
    rangeTo: number,
    numberOfRuns: number,
    customValues: number[]
}

export enum SensitivityPlotType {
    TraceOverTime = "TraceOverTime",
    ValueAtTime = "ValueAtTime",
    ValueAtExtreme = "ValueAtExtreme",
    TimeAtExtreme = "TimeAtExtreme"
}

export enum SensitivityPlotExtremePrefix {
    time = "t",
    value = "y"
}

export enum SensitivityPlotExtreme {
    Min = "Min",
    Max = "Max"
}

export interface SensitivityPlotSettings {
    plotType: SensitivityPlotType,
    extreme: SensitivityPlotExtreme,
    time: null | number
}

export interface SensitivityUpdateRequiredReasons {
    modelChanged: boolean;
    parameterValueChanged: boolean;
    endTimeChanged: boolean;
    sensitivityOptionsChanged: boolean;
    numberOfReplicatesChanged: boolean;
}

export interface SensitivityState {
    paramSettings: SensitivityParameterSettings,
    // Whether sensitivity needs to be re-run because of change to settings or model
    sensitivityUpdateRequired: SensitivityUpdateRequiredReasons
    plotSettings: SensitivityPlotSettings,
    result: OdinSensitivityResult | null;
    parameterSetResults: Dict<OdinSensitivityResult>,
    downloading: boolean,
    userSummaryDownloadFileName: string,

    // true only in stochastic mode when odinWorker produces multiple sensitivity
    // traces sequentially. This toggle is required to show how many runs out of
    // the total have finished.  Turned off when all runs are complete
    running: boolean
    // true in all modes when user clicks run button, turned off in the allPlotData
    // function in sensitivity plot components since they take the longest in
    // reshaping the data
    loading: boolean
}
