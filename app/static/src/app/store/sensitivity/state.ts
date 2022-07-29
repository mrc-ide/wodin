export enum SensitivityScapeType {
    Arithmetic = "Arithmetic",
    Logarithmic = "Logarithmic"
}

export enum SensitivityVariationType {
    Percentage = "Percentage",
    Range = "Range"
}

export interface SensitivitySettings {
    parameterToVary: string | null,
    scaleType: SensitivityScapeType,
    variationType: SensitivityVariationType,
    variationPercentage: number,
    rangeFrom: number | null,
    rangeTo: number | null,
    numberOfRuns: number
}

export interface SensitivityState {
    settings: SensitivitySettings
}
