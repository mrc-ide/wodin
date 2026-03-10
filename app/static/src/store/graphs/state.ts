import { WodinPlotData } from "@/plot";

export type ConfigId = string
export type SyncedConfigGroupId = string
export type SyncedGraphGroupId = string

export type AxisRange = [number, number]

// User-adjustable settings for a given graph - log/linear y axis scale and
// lock y axis are selected via checkboxes, yAxisRange is saved on data/variable
// update in order to implement lock y axis.
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

export type DataWithConfigId = {
  configId: ConfigId,
  data: WodinPlotData,
}

/*
  This has many layers of indirection to create a flexible and general
  structure for graphs and remove the distinction between fit graphs and
  non fit graphs (like run and sensitivity)

  `configs` - an array of all the configs the user/tabs have created in the
    app, this is regardless of where they are use, e.g. run tab and fit tab
    configs all live here

  `syncedConfigGroups` - an object with keys as the config group id (in wodin
    the tabs will decide this key) and value as a collection of config ids and
    what properties to sync between these configs (in wodin this can be configs
    shown in run tab that have their `xAxisRange`s synced)

  `syncedGraphGroups` - an object with keys as graph group id (once again the
    tabs will decide this) and value containing config group id and data type
    this graph group displays. This data type can then be updated by sensitivity
    plot options, for example when you change plot type. This layer of indirection
    is needed because the run tab and sensitivity tab may use the same synced
    config group but show different data types

  `visibleData` - not all of the group groups above will be displayed, they will
    live in state so that the run tab graph config remembers user selections even
    if user is looking at the fit tab. This field contains all the graph groups
    that are visible on the page and contains their associated data. We include
    the config id as it is convenient, it technically is not needed as data array
    is in the same order as the configs in the config group
*/
export type GraphsState = {
  configs: GraphConfig[],
  syncedConfigGroups: Record<SyncedConfigGroupId, SyncedConfigGroup>,
  syncedGraphGroups: Record<SyncedGraphGroupId, SyncedGraphGroup>,
  visibleGraphGroups: SyncedGraphGroupId[],
  visibleData: Record<SyncedGraphGroupId, DataWithConfigId[]>,
}

export const defaultGraphConfig = (id: string): GraphConfig => ({
  id,
  selectedVariables: [],
  logScaleYAxis: false,
  lockYAxis: false,
  xAxisRange: null,
  yAxisRange: null,
});
