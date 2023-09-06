export type AxesRange = {
    x: [number, number],
    y: [number, number]
}

export interface GraphSettingsState {
    logScaleYAxis: boolean,
    lockAxes: boolean,
    axesRange: AxesRange
}
