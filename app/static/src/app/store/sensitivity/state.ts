import {Batch, WodinError} from "../../types/responseTypes";

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

export interface SensitivityState {
    paramSettings: SensitivityParameterSettings,
    batch: Batch | null,
    // Whether sensitivity needs to be re-run because of change to settings or model
    sensitivityUpdateRequired: boolean
    plotSettings: SensitivityPlotSettings,
    error: WodinError | null
}
