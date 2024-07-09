export type YAxisRange = [number, number];

export interface GraphSettings {
    logScaleYAxis: boolean;
    lockYAxis: boolean;
    yAxisRange: YAxisRange;
}

export interface GraphConfig {
    id: string; // We need to keep a persistent id to identify configs in vue when a graph is deleted from the array
    selectedVariables: string[];
    unselectedVariables: string[]; // We keep track of unselected variables too so we can retain on model update
    settings: GraphSettings;
}

export interface GraphsState {
    config: GraphConfig[];
    fitGraphSettings: GraphSettings; // For Fit apps, the Fit tab graph needs to have its own settings
}

export const defaultGraphSettings = (): GraphSettings => ({
    logScaleYAxis: false,
    lockYAxis: false,
    yAxisRange: [0, 0]
});

