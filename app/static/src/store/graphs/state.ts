import { Lines, ScatterPoints } from "@reside-ic/skadi-chart";

export type Metadata = {
  name: string,
  tooltipName: string,
  color: string
};

export type WodinPlotData = {
  lines: Lines<Metadata>,
  points: ScatterPoints<Metadata>
};

export const fitGraphId = "FIT";

export const defaultGraphConfig = (): GraphConfig => ({
    selectedVariables: [],
    logScaleYAxis: false,
    lockYAxis: false,
    xAxisRange: null,
    yAxisRange: null,
});

export type AxisRange = [number, number];

// GraphConfig holds all the configuration for the user-configurable array of graphs which will be shown on the Run
// and Sensitivity tabs, both the variable selections and the graph settings.
export interface GraphConfig {
    selectedVariables: string[];
    logScaleYAxis: boolean;
    lockYAxis: boolean;
    xAxisRange: AxisRange | null;
    yAxisRange: AxisRange | null;
}

export interface Graph {
  id: string;
  config: GraphConfig,
  data: WodinPlotData
}

export interface GraphsState {
    graphs: Graph[];
    fitGraph: Graph; // For Fit apps, the Fit tab graph needs to have its own settings
}

