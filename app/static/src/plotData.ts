import { ActionContext } from "vuex";
import { AppState, AppType, VisualisationTab } from "./store/appState/state";
import { GraphConfig, WodinPlotData } from "./store/graphs/state";
import { allFitDataToSkadiChart, discreteSeriesSetToSkadiChart, filterSeriesSet, filterUserTypeSeriesSet, fitDataToSkadiChart, odinToSkadiChart, paramSetLineStyle, updatePlotTraceName } from "./plot";
import { FitState } from "./store/fit/state";
import { StochasticState } from "./store/stochastic/state";
import { FitDataGetter } from "./store/fitData/getters";
import { Batch, FilteredDiscreteSolution, OdinSeriesSet, OdinSolution, OdinUserTypeSeriesSet } from "./types/responseTypes";
import { LineStyle } from "@reside-ic/skadi-chart";
import { SensitivityPlotExtremePrefix, SensitivityPlotType } from "./store/sensitivity/state";

export const getPlotData = <T>(
  ctx: ActionContext<T, AppState>,
  cfg: GraphConfig,
) => {
  const { appType, openVisualisationTab, sensitivity } = ctx.rootState;
  if (openVisualisationTab === VisualisationTab.Run) {
    return appType === AppType.Stochastic
      ? getRunTracesDiscreteData(ctx as ActionContext<T, StochasticState>, cfg)
      : getRunTracesContinuousData(ctx, cfg);
  } else if (openVisualisationTab === VisualisationTab.Fit) {
    return getFitTraceData(ctx as ActionContext<T, FitState>, cfg);
  } else if (
    openVisualisationTab === VisualisationTab.Sensitivity
    && sensitivity.plotSettings.plotType === SensitivityPlotType.TraceOverTime
  ) {
    return getSensitivityTracesData(ctx, cfg);
  } else {
    return getSensitivitySummaryData(ctx, cfg);
  }
}

const getAllFitData = <T>(
  { rootState }: ActionContext<T, AppState>,
) => {
  const fitState = rootState as FitState;
  if (!fitState.fitData) return null;
  const { data, timeVariable, linkedVariables } = fitState.fitData;
  if (!data || !timeVariable) return null;

  return { data, linkedVariables, timeVariable };
}

const getLineStylesForParameterSets = <T>(
  { rootState }: ActionContext<T, AppState>,
) => {
  const result: Record<string, string> = {};
  rootState.run.parameterSets.forEach((set, idx) => {
    result[set.name] = paramSetLineStyle(idx);
  });
  return result;
}

export type TRange = [number, number]

const getTRange = (
  { xAxisRange }: GraphConfig,
  endTime: number
): TRange => {
  return [
    xAxisRange ? xAxisRange[0] : 0,
    xAxisRange ? xAxisRange[1] : endTime,
  ];
};

const getResult = <T extends OdinSolution | FilteredDiscreteSolution>(
  solution: T | null | undefined,
  tRange: TRange
) => {
  const options = {
    mode: "grid",
    tStart: tRange[0],
    tEnd: tRange[1],
    nPoints: 1000
  } as const;

  return solution && solution(options);
};

const getFitTraceData = <T>(
  ctx: ActionContext<T, FitState>,
  cfg: GraphConfig
) => {
  const { rootState, rootGetters } = ctx;
  const { data } = rootState.fitData;
  const { result: modelFitResult } = rootState.modelFit;
  const { resultOde } = rootState.run;
  const { paletteModel } = rootState.model;

  const plotRehydratedFit = modelFitResult && !modelFitResult.solution && !modelFitResult.error;

  const solution = plotRehydratedFit
    ? resultOde?.solution
    : modelFitResult?.solution;

  const endTime = plotRehydratedFit
    ? modelFitResult?.inputs.endTime
    : rootGetters[`fitData/${FitDataGetter.dataEnd}`];

  const link = plotRehydratedFit
      ? modelFitResult?.inputs.link
      : rootGetters[`fitData/${FitDataGetter.link}`];

  const tRange = getTRange(cfg, endTime);
  const result = getResult(solution, tRange);

  if (!data || !link || !result) return { lines: [], points: [] };

  return {
    lines: odinToSkadiChart(filterSeriesSet(result, [link.model]), paletteModel!),
    points: fitDataToSkadiChart(data, link, paletteModel!, tRange[0], tRange[1])
  };
}

const getRunTracesDiscreteData = <T>(
  ctx: ActionContext<T, StochasticState>,
  cfg: GraphConfig
) => {
  const { rootState } = ctx;
  const { endTime, resultDiscrete, numberOfReplicates } = rootState.run;
  const { maxReplicatesDisplay } = rootState.config!;
  const { paletteModel } = rootState.model;

  const tRange = getTRange(cfg, endTime);
  const result = getResult(resultDiscrete?.solution, tRange);

  if (!result) return { lines: [], points: [] };

  const showIndividualTraces = numberOfReplicates <= maxReplicatesDisplay;

  return {
    lines: discreteSeriesSetToSkadiChart(
      filterSeriesSet(result, cfg.selectedVariables),
      paletteModel!,
      showIndividualTraces
    ),
    points: []
  }
};

const getRunTracesContinuousData = <T>(
  ctx: ActionContext<T, AppState>,
  cfg: GraphConfig
) => {
  const { rootState } = ctx;
  const { endTime, resultOde, parameterSetResults, parameterSets } = rootState.run;
  const { paletteModel } = rootState.model;

  const tRange = getTRange(cfg, endTime);
  const result = getResult(resultOde?.solution, tRange);

  if (!result) return { lines: [], points: [] };

  // 1. Current parameter values
  const allData: WodinPlotData = {
    lines: odinToSkadiChart(
      filterSeriesSet(result, cfg.selectedVariables),
      paletteModel!
    ),
    points: allFitDataToSkadiChart(
      getAllFitData(ctx),
      paletteModel!,
      tRange[0],
      tRange[1],
      cfg.selectedVariables
    )
  };

  // 2. Parameter sets
  const lineStylesForParamSets = getLineStylesForParameterSets(ctx);

  Object.entries(parameterSetResults).forEach(([name, sln]) => {
    const currentParamSet = parameterSets.find(set => set.name === name)!;
    if (!sln || currentParamSet.hidden) return;

    const result = getResult(sln?.solution, tRange);
    if (!result) return;

    const strokeDasharray = lineStylesForParamSets[name];
    const filteredSetData = filterSeriesSet(result, cfg.selectedVariables);
    const plotData = odinToSkadiChart(filteredSetData, paletteModel!, { strokeDasharray });
    plotData.forEach(line => {
      line.metadata!.tooltipName = `${line.metadata!.name} (${currentParamSet.displayName})`;
    });
    allData.lines.push(...plotData);
  });

  return allData;
};

const getSensitivityTracesData = <T>(
  ctx: ActionContext<T, AppState>,
  cfg: GraphConfig
) => {
  const { rootState } = ctx;
  const { result: sensitivityResult, paramSettings, parameterSetResults } = rootState.sensitivity;
  const {
    endTime,
    parameterSets,
    resultOde,
    resultDiscrete,
    parameterSetResults: centralParameterSetResults
  } = rootState.run;
  const { paletteModel } = rootState.model;

  const batch = sensitivityResult?.batch;

  const allData: WodinPlotData = { lines: [], points: [] };

  if (!batch?.solutions.length) return allData;

  const { pars } = batch;
  const tRange = getTRange(cfg, endTime);

  const varyingParamName = paramSettings.parameterToVary;
  const varyingPar = pars.varying.filter(v => v.name === varyingParamName);
  const parValues = varyingPar.length ? varyingPar[0].values : [];

  const resultToSkadiChartLines = (result: OdinSeriesSet | null | undefined, style?: LineStyle) => {
    if (!result) return [];
    return odinToSkadiChart(
      filterSeriesSet(result, cfg.selectedVariables),
      paletteModel!,
      style
    );
  };

  // 1. add sensitivity traces
  batch.solutions.forEach((sln: OdinSolution, slnIdx: number) => {
    const result = getResult(sln, tRange);
    const lines = resultToSkadiChartLines(result, { strokeWidth: 1 });
    lines.forEach(l => updatePlotTraceName(l, varyingParamName, parValues[slnIdx]));
    allData.lines.push(...lines);
  });

  // 2. add central traces (actual param value instead of sensitivity range around value)
  if (rootState.appType === AppType.Stochastic) {
    const result = getResult(resultDiscrete?.solution, tRange);
    if (result) {
      result.values = result.values.filter(v => v.description !== "Individual");
      const lines = resultToSkadiChartLines(result);
      allData.lines.push(...lines);
    }
  } else {
    const result = getResult(resultOde?.solution, tRange);
    const lines = resultToSkadiChartLines(result);
    allData.lines.push(...lines);
  }

  // 1 and 2 for parameter sets
  const lineStylesForParamSets = getLineStylesForParameterSets(ctx);

  Object.entries(parameterSetResults).forEach(([name, slns]) => {
    const currentParamSet = parameterSets.find(set => set.name === name)!;
    if (!slns.batch || currentParamSet.hidden) return;

    // 1
    const strokeDasharray = lineStylesForParamSets[name];
    slns.batch.solutions.forEach((sln, slnIdx) => {
      const result = getResult(sln, tRange);
      const lines = resultToSkadiChartLines(result, { strokeDasharray, strokeWidth: 1 });
      lines.forEach(l =>
        updatePlotTraceName(l, varyingParamName, parValues[slnIdx], currentParamSet.displayName));
      allData.lines.push(...lines);
    });

    // 2
    const centralSln = centralParameterSetResults[name]?.solution;
    if (!centralSln) return;
    const result = getResult(centralSln, tRange);
    const lines = resultToSkadiChartLines(result, { strokeDasharray });
    lines.forEach(l => updatePlotTraceName(l, null, null, currentParamSet.displayName));
  });

  allData.points.push(...allFitDataToSkadiChart(
    getAllFitData(ctx),
    paletteModel!,
    tRange[0],
    tRange[1],
    cfg.selectedVariables,
  ))

  return allData;
};

const getSensitivitySummaryData = <T>(
  ctx: ActionContext<T, AppState>,
  cfg: GraphConfig
) => {
  const { rootState } = ctx;
  const { result: sensitivityResult, paramSettings, plotSettings, parameterSetResults } = rootState.sensitivity;
  const { paletteModel } = rootState.model;
  const { parameterSets } = rootState.run;

  const allData: WodinPlotData = { lines: [], points: [] };

  if (!sensitivityResult?.batch) return allData;

  const paramName = paramSettings.parameterToVary;
  let getSeriesFromBatch: (batch: Batch) => OdinUserTypeSeriesSet;
  if (plotSettings.plotType === SensitivityPlotType.ValueAtTime) {
    getSeriesFromBatch = batch => batch.valueAtTime(plotSettings.time!);
  } else {
    const paramPrefix = plotSettings.plotType === SensitivityPlotType.TimeAtExtreme
      ? SensitivityPlotExtremePrefix.time
      : SensitivityPlotExtremePrefix.value;
    getSeriesFromBatch = batch => batch.extreme(`${paramPrefix}${plotSettings.extreme}`);
  }

  const filtered = filterUserTypeSeriesSet(
    getSeriesFromBatch(sensitivityResult.batch),
    paramName!,
    cfg.selectedVariables
  );
  allData.lines.push(...odinToSkadiChart(filtered, paletteModel!));

  const lineStylesForParamSets = getLineStylesForParameterSets(ctx);

  Object.entries(parameterSetResults).forEach(([name, sln]) => {
    const currentParamSet = parameterSets.find(set => set.name === name)!;
    if (!sln.batch || currentParamSet.hidden) return;

    const strokeDasharray = lineStylesForParamSets[name];
    const filtered = filterUserTypeSeriesSet(
      getSeriesFromBatch(sln.batch),
      paramName!,
      cfg.selectedVariables
    );
    const lines = odinToSkadiChart(filtered, paletteModel!, { strokeDasharray, strokeWidth: 1 });
    lines.forEach(l => updatePlotTraceName(l, null, null, currentParamSet.displayName));
    allData.lines.push(...lines);
  });

  return allData;
};
