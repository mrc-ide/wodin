import {OdinSolution} from "../../types/responseTypes";

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

export interface SensitivityState {
    paramSettings: SensitivityParameterSettings,
    solutions: OdinSolution[]
}
