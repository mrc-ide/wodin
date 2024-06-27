export type YAxisRange = [number, number];

export interface GraphSettings {
    logScaleYAxis: boolean;
    lockYAxis: boolean;
    yAxisRange: YAxisRange;
}

export interface GraphConfig {
    selectedVariables: string[];
    unselectedVariables: string[]; // We keep track of unselected variables too so we can retain on model update
}

export interface GraphsState {
    config: GraphConfig[];
    settings: GraphSettings; // TODO: this will be replaced by per-graph settings in mrc-5442
}
