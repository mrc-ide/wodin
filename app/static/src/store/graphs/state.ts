import { WodinPlotData } from "@/plot";

export type ConfigId = string
export type ConfigGroupId = string
export type GraphGroupId = string

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

export type SyncProperty = Exclude<keyof GraphConfig, "id">

export type ConfigGroup = {
  syncProperties: SyncProperty[],
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

export type GraphGroup = {
  configIds: ConfigId[],
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

  `configGroups` - an object with keys as the config group id (in wodin
    the tabs will decide this key) and value as a collection of config ids and
    what properties to sync between these configs. In wodin, the config groups
    are `RunAndSens` and `Fit`, which have their `xAxisRange`s synced - note
    that run and sensitivity tabs share a config group

  `graphGroups` - an object with keys as graph group id (once again the
    tabs will decide this) and value containing config ids and data type
    this graph group displays. This data type can then be updated by sensitivity
    plot options, for example when you change plot type. In Wodin, graph groups
    are each of the tabs which mirror the config groups' config ids but with a
    given data type, e.g. run tab mirrors `RunAndSens` config group config ids
    with the `Run` data type whereas the sensitivity tab mirrors `RunAndSens`
    config group with the `Sensitivity` or `SensitivityValueAtTime` data types.

    Note: an implicit assumption is that all the graphs in a graph group are
    visible or none of them are. This is not enforced in the code anywhere and
    not meeting this assumption will not break anything however, it may lead to
    performance issues as we re-calculate the data for all configs contained in
    a graph group at every store plugin update

  `visibleGraphGroups` - not all of the group groups above will be displayed, they
    will live in state so that the run tab graph config remembers user selections
    even if user is looking at the fit tab. This field contains all the graph groups
    that are visible on the page.

  `visibleData` - this contains data for the visible graph groups. Data is paired
    with the config id for convenience - this is not needed as the data is in the
    same order as the config ids in the config group associated with this visible
    graph group
*/
export type GraphsState = {
  configs: GraphConfig[],
  configGroups: Record<ConfigGroupId, ConfigGroup>,
  graphGroups: Record<GraphGroupId, GraphGroup>,
  visibleGraphGroups: GraphGroupId[],
  visibleData: Record<GraphGroupId, DataWithConfigId[]>,
}

export const defaultGraphConfig = (id: string): GraphConfig => ({
  id,
  selectedVariables: [],
  logScaleYAxis: false,
  lockYAxis: false,
  xAxisRange: null,
  yAxisRange: null,
});
