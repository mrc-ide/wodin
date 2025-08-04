import { format } from "d3-format";
import { Palette, paletteData } from "./palette";
import type { AllFitData, FitData, FitDataLink } from "./store/fitData/state";
import { DiscreteSeriesSet, OdinSeriesSet, OdinSeriesSetValues, OdinUserTypeSeriesSet } from "./types/responseTypes";
import { Dict } from "./types/utilTypes";
import { Lines, ScatterPoints, LineStyle, Point } from "skadi-chart";

export type Metadata = {
  name: string,
  tooltipName: string,
  color: string
};
export type WodinPlotData = { lines: Lines<Metadata>, points: ScatterPoints<Metadata> };

export const fadePlotStyle = "opacity:0.5;";

export function filterUserTypeSeriesSet(s: OdinUserTypeSeriesSet, param: string, names: string[]): OdinSeriesSet {
  const values = s.values.filter((v) => names.includes(v.name));
  const xValues = s.x.map((x) => x[param]);
  return {
    x: xValues,
    values
  };
}

export function filterSeriesSet(s: OdinSeriesSet, names: string[]): OdinSeriesSet {
  const values = s.values.filter((v) => names.includes(v.name));
  return {
    x: s.x,
    values
  };
}

function filterData(data: FitData, timeVariable: string, start: number, end: number) {
  return data.filter((row: Dict<number>) => row[timeVariable] >= start && row[timeVariable] <= end);
}

type SkadiChartStyle = LineStyle;
type SkadiChartStyleNoColor = Omit<LineStyle, "color">;
type SkadiChartPoints = Point[];

const defaultSkadiChartStyle: SkadiChartStyleNoColor = {
  strokeWidth: 2
};

export function odinToSkadiChart(
  s: OdinSeriesSet,
  palette: Palette,
  style: SkadiChartStyleNoColor = {}
): WodinPlotData["lines"] {
  const skadiChartStyle = {
    ...defaultSkadiChartStyle,
    ...style
  };

  return s.values.map(el => {
    const points: SkadiChartPoints = s.x.map((x, i) => ({ x, y: el.y[i] }));
    const color = palette[el.name];
    const style: SkadiChartStyle = {
      color,
      strokeWidth: skadiChartStyle.strokeWidth,
      strokeDasharray: skadiChartStyle.strokeDasharray,
      opacity: skadiChartStyle.opacity
    };
    return {
      points, style,
      metadata: {
        name: el.name,
        tooltipName: el.name,
        color
      }
    };
  });
}

export function discreteSeriesSetToSkadiChart(
  s: DiscreteSeriesSet,
  palette: Palette,
  showIndividualTraces: boolean
): WodinPlotData["lines"] {
  const series = showIndividualTraces ? s.values : s.values.filter((el) => el.description !== "Individual");
  return series.map((values: OdinSeriesSetValues) => {
    const isIndividual = values.description === "Individual";

    const points: SkadiChartPoints = s.x.map((x, i) => ({ x, y: values.y[i] }));
    const color = palette[values.name];
    const style: SkadiChartStyle = {
      color,
      strokeWidth: isIndividual ? 0.5 : 2,
      opacity: isIndividual ? 0.5 : 1
    };
    return {
      points, style,
      metadata: {
        name: values.name,
        tooltipName: values.name,
        color
      }
    };
  });
}

export function fitDataToSkadiChart(
  data: FitData,
  link: FitDataLink,
  palette: Palette,
  start: number,
  end: number
): WodinPlotData["points"] {
  const filteredData = filterData(data, link.time, start, end);
  const points: WodinPlotData["points"] = [];
  const color = palette[link.model];
  for (let i = 0; i < filteredData.length; i++) {
    const d = filteredData[i];
    points.push({
      x: d[link.time],
      y: d[link.data],
      style: { color },
      metadata: {
        name: link.data,
        tooltipName: link.data,
        color
      }
    });
  }
  return points;
}

export function allFitDataToSkadiChart(
  allFitData: AllFitData | null,
  paletteModel: Palette,
  start: number,
  end: number,
  selectedVariables: string[]
): WodinPlotData["points"] {
  if (!allFitData) return [];

  const { data, linkedVariables, timeVariable } = allFitData;
  const filteredData = filterData(data, timeVariable, start, end);
  const palette = paletteData(Object.keys(linkedVariables));

  return Object.keys(linkedVariables).flatMap((name: string): WodinPlotData["points"] => {
    let color = palette[name];
    const variable = linkedVariables[name];
    if (variable) {
      // If there is a linked variable, only show data if the variable is selected - if not selected, render the
      // series, but as transparent so that all graph x axes are consistent
      color = selectedVariables.includes(variable) ? paletteModel[variable] : "transparent";
    }

    const points: WodinPlotData["points"] = [];
    for (let i = 0; i < filteredData.length; i++) {
      const d = filteredData[i];
      points.push({
        x: d[timeVariable],
        y: d[name],
        style: { color },
        metadata: {
          name,
          tooltipName: name,
          color
        }
      });
    }
    return points;
  });
}

// these are in the form of stroke-dasharray css property
// https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-dasharray#example
const lineStyles = ["3", "10", "15", "8 3 3 3", "15 4 3 4"];
export const paramSetLineStyle = (index: number): string => lineStyles[index % lineStyles.length];

export const updatePlotTraceName = (
  plotTrace: WodinPlotData["lines"][number],
  param: string | null,
  value: number | null,
  parameterSetName = ""
): void => {
  const parenthesisItems = [];
  if (param && value) {
    parenthesisItems.push(`${param}=${format(".3f")(value)}`);
  }
  if (parameterSetName) {
    parenthesisItems.push(parameterSetName);
  }
  plotTrace.metadata!.tooltipName = `${plotTrace.metadata!.name} (${parenthesisItems.join(" ")})`;
};
