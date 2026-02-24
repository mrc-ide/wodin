import { Lines, ScatterPoints } from "@reside-ic/skadi-chart";
import { SensitivityPlotType } from "../sensitivity/state";

export type Metadata = {
  name: string,
  tooltipName: string,
  color: string
};

export type WodinPlotData = {
  lines: Lines<Metadata>,
  points: ScatterPoints<Metadata>
};

export const fitGraphId = "FIT" as const;

export const defaultGraphConfig = (): GraphConfig => ({
    selectedVariables: [],
    logScaleYAxis: false,
    lockYAxis: false,
    xAxisRange: null,
    yAxisRange: null,
});

export const defaultData = (): WodinPlotData => ({ lines: [], points: [] });


export function defaultGraphData(id: typeof fitGraphId): GraphData<FitGraphType>;
export function defaultGraphData(id: string): GraphData<NonFitGraphType>;
export function defaultGraphData(id: string) {
  if (id === fitGraphId) {
    return {
      fitData: defaultData()
    };
  } else {
    return {
      runData: defaultData(),
      sensitivityTracesData: defaultData(),
      sensitivityValueAtTimeData: defaultData(),
      sensitivityTimeAtExtremeData: defaultData(),
      sensitivityValueAtExtremeData: defaultData(),
    };
  }
};

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

export const FitGraphType = {
  Fit: "fit",
} as const;
export type FitGraphType = typeof FitGraphType;
export type FitGraphTypeValue = FitGraphType[keyof FitGraphType];

export const NonFitGraphType = {
  Run: "run",
  SensitivityTraces: "sensitivityTraces",
  SensitivityValueAtTime: "sensitivityValueAtTime",
  SensitivityTimeAtExtreme: "sensitivityTimeAtExtreme",
  SensitivityValueAtExtreme: "sensitivityValueAtExtreme",
} as const;
export type NonFitGraphType = typeof NonFitGraphType;
export type NonFitGraphTypeValue = NonFitGraphType[keyof NonFitGraphType];

// probably temporary, worth changing sensitivity plot type in a later PR
// to NonFitGraphType?
export const plotTypeToGraphType = {
    [SensitivityPlotType.TraceOverTime]: NonFitGraphType.SensitivityTraces,
    [SensitivityPlotType.ValueAtTime]: NonFitGraphType.SensitivityValueAtTime,
    [SensitivityPlotType.TimeAtExtreme]: NonFitGraphType.SensitivityTimeAtExtreme,
    [SensitivityPlotType.ValueAtExtreme]: NonFitGraphType.SensitivityValueAtExtreme
} as const;

export type BaseGraph = { id: string, config: GraphConfig }

type GraphData<T extends Record<string, string>> = {
  -readonly [K in keyof T as `${T[K]}Data`]: WodinPlotData
}

export type NonFitGraph = BaseGraph & GraphData<NonFitGraphType>;
export type FitGraph = BaseGraph & GraphData<FitGraphType>;

export type Graph = FitGraph | NonFitGraph

export type GraphType =
    | FitGraphTypeValue
    | NonFitGraphTypeValue

export interface GraphsState {
    mountedGraphTypes: GraphType[],
    graphs: NonFitGraph[],
    fitGraph: FitGraph, // For Fit apps, the Fit tab graph needs to have its own settings
}

