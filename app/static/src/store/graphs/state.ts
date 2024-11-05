export type YAxisRange = [number, number];

// User-adjustable settings for a given graph - log/linear y axis scale and lock y axis are selected via checkboxes,
// yAxisRange is saved on data/variable update in order to implement lock y axis.
export interface GraphSettings {
    logScaleYAxis: boolean;
    lockYAxis: boolean;
    yAxisRange: YAxisRange;
}

// GraphConfig holds all the configuration for the user-configurable array of graphs which will be shown on the Run
// and Sensitivity tabs, both the variable selections and the graph settings.
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
