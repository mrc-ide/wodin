import { WodinPlotData } from "@/plot";

export type ConfigId = string
export type SyncedConfigGroupId = string
export type SyncedGraphGroupId = string

export type AxisRange = [number, number]

// User-adjustable settings for a given graph - log/linear y axis scale and lock y axis are selected via checkboxes,
// yAxisRange is saved on data/variable update in order to implement lock y axis.
export type GraphConfig = {
  id: ConfigId,
  selectedVariables: string[],
  logScaleYAxis: boolean,
  lockYAxis: boolean,
  xAxisRange: AxisRange | null,
  yAxisRange: AxisRange | null,
}

export type SyncedConfigGroup = {
  syncProperties: (keyof GraphConfig)[],
  configIds: ConfigId[],
}

export enum DataType {
  Run = "run",
  Fit = "fit",
  Sensitivity = "sensitivity",
  SensitivityValueAtTime = "sensitivityValueAtTime",
  SensitivityTimeAtExtreme = "sensitivityTimeAtExtreme",
  SensitivityValueAtExtreme = "sensitivityValueAtExtreme",
}

export type SyncedGraphGroup = {
  syncedConfigGroupId: SyncedConfigGroupId,
  dataType: DataType,
}

export type DataWithConfig = {
  configId: ConfigId,
  data: WodinPlotData,
}

export type GraphsState = {
  configs: GraphConfig[],
  syncedConfigGroups: Record<SyncedConfigGroupId, SyncedConfigGroup>,
  syncedGraphGroups: Record<SyncedGraphGroupId, SyncedGraphGroup>,
  visibleData: Record<SyncedGraphGroupId, DataWithConfig[]>,
}

export const defaultGraphConfig = (id: string): GraphConfig => ({
  id,
  selectedVariables: [],
  logScaleYAxis: false,
  lockYAxis: false,
  xAxisRange: null,
  yAxisRange: null,
});
