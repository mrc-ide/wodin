import { OdinSensitivityResult } from "../../types/wrapperTypes";

export enum SensitivityScaleType {
    Arithmetic = "Arithmetic",
    Logarithmic = "Logarithmic"
}

export enum SensitivityVariationType {
    Percentage = "Percentage",
    Range = "Range"
}

export interface SensitivityParameterSettings {
    parameterToVary: string | null,
    scaleType: SensitivityScaleType,
    variationType: SensitivityVariationType,
    variationPercentage: number,
    rangeFrom: number,
    rangeTo: number,
    numberOfRuns: number
}

export enum SensitivityPlotType {
    TraceOverTime = "TraceOverTime",
    ValueAtTime = "ValueAtTime",
    ValueAtExtreme = "ValueAtExtreme",
    TimeAtExtreme = "TimeAtExtreme"
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
}

export interface SensitivityState {
    paramSettings: SensitivityParameterSettings,
    // Whether sensitivity needs to be re-run because of change to settings or model
    sensitivityUpdateRequired: SensitivityUpdateRequiredReasons
    plotSettings: SensitivityPlotSettings,
    result: OdinSensitivityResult | null;
    running: boolean;
}
