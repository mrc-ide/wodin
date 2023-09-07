export type YAxisRange = [number, number]

export interface GraphSettingsState {
    logScaleYAxis: boolean,
    lockYAxis: boolean,
    yAxisRange: YAxisRange
}
