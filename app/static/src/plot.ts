import { format } from "d3-format";
import { Palette, paletteData } from "./palette";
import type { AllFitData, FitData, FitDataLink } from "./store/fitData/state";
import { DiscreteSeriesSet, OdinSeriesSet, OdinSeriesSetValues, OdinUserTypeSeriesSet } from "./types/responseTypes";
import { Dict } from "./types/utilTypes";
import { Lines, ScatterPoints, LineStyle, Point } from "@reside-ic/skadi-chart";
import { StaticConfig } from "./wodinStaticUtils";

export type Metadata = {
  name: string,
  tooltipName: string,
  color: string
};
export type WodinPlotData = { lines: Lines<Metadata>, points: ScatterPoints<Metadata> };

export const fadePlotStyle = "opacity:0.5;";

const particleRegex = / \[P=(\d)*\]$/

export function filterUserTypeSeriesSet(
  s: OdinUserTypeSeriesSet,
  param: string,
  names: string[],
  staticConfig: Partial<StaticConfig["static"]>
): OdinSeriesSet {
  const values = s.values.filter(v => {
    let name = v.name;
    if (staticConfig.legend) {
      Object.entries(staticConfig.legend).forEach(([k, val]) => {
        if (name.startsWith(k)) {
          name = name.replace(k, val.label);
        }
      });
    }
    name = name.replace(particleRegex, "");
    return names.includes(name)
  });
  const xValues = s.x.map((x) => x[param]);
  return {
    x: xValues,
    values
  };
}

export function filterSeriesSet(
  s: OdinSeriesSet, names: string[], staticConfig: Partial<StaticConfig["static"]>
): OdinSeriesSet {
  const values = s.values.filter(v => {
    let name = v.name;
    if (staticConfig.legend) {
      Object.entries(staticConfig.legend).forEach(([k, val]) => {
        if (name.startsWith(k)) {
          name = name.replace(k, val.label);
        }
      });
    }
    name = name.replace(particleRegex, "");
    return names.includes(name);
  });
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
  style: SkadiChartStyleNoColor = {},
  staticConfig: Partial<StaticConfig["static"]>,
): WodinPlotData["lines"] {
  const skadiChartStyle = {
    ...defaultSkadiChartStyle,
    ...style
  };

  return s.values.map(el => {
    const points: SkadiChartPoints = s.x.map((x, i) => ({ x, y: el.y[i] }));
    let color = palette[el.name];
    let name = el.name;

    if (staticConfig.legend) {
      Object.entries(staticConfig.legend).forEach(([k, val]) => {
        if (name.startsWith(k)) {
          name = name.replace(k, val.label);
          color = val.color;
        }
      });
    }

    let tooltipName = name;
    const isMultipleParticles = particleRegex.test(name);
    if (isMultipleParticles) {
      name = name.replace(particleRegex, "");
    }

    const opacity = skadiChartStyle.opacity || 1;
    const style: SkadiChartStyle = {
      strokeColor: color,
      strokeWidth: skadiChartStyle.strokeWidth,
      strokeDasharray: skadiChartStyle.strokeDasharray,
      opacity: isMultipleParticles ? opacity / 4 : opacity
    };
    return {
      points, style,
      metadata: {
        name,
        tooltipName,
        color
      }
    };
  });
}

export function discreteSeriesSetToSkadiChart(
  s: DiscreteSeriesSet,
  palette: Palette,
  showIndividualTraces: boolean,
  staticConfig: Partial<StaticConfig["static"]>,
): WodinPlotData["lines"] {
  const series = showIndividualTraces ? s.values : s.values.filter((el) => el.description !== "Individual");
  return series.map((values: OdinSeriesSetValues) => {
    const isIndividual = values.description === "Individual";
    let name = values.description === "Mean" ? values.name + " (mean)" : values.name;

    const points: SkadiChartPoints = s.x.map((x, i) => ({ x, y: values.y[i] }));
    let color = palette[values.name];

    if (staticConfig.legend) {
      Object.entries(staticConfig.legend).forEach(([k, val]) => {
        if (name.startsWith(k)) {
          name = name.replace(k, val.label);
          color = val.color;
        }
      });
    }

    let tooltipName = name;
    const isMultipleParticles = particleRegex.test(name)
    if (isMultipleParticles) {
      name = name.replace(particleRegex, "");
    }

    const opacity = isIndividual ? 0.5 : 1;
    const style: SkadiChartStyle = {
      strokeColor: color,
      strokeWidth: isIndividual ? 0.5 : 2,
      opacity: isMultipleParticles ? opacity / 4 : opacity
    };
    return {
      points, style,
      metadata: {
        name,
        tooltipName,
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
    const variable = linkedVariables[name]!;
    color = selectedVariables.includes(variable) ? paletteModel[variable] : color;

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
