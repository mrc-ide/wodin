import { Dash, Margin, PlotData } from "plotly.js-basic-dist-min";
import { format } from "d3-format";
import { Palette, paletteData } from "./palette";
import type { AllFitData, FitData, FitDataLink } from "./store/fitData/state";
import { DiscreteSeriesSet, OdinSeriesSet, OdinSeriesSetValues, OdinUserTypeSeriesSet } from "./types/responseTypes";
import { Dict } from "./types/utilTypes";

type NumberArrayPlotData = Omit<PlotData, "x" | "y"> & { x: number[], y: number[] }
export type WodinPlotData = Partial<NumberArrayPlotData>[];

export const fadePlotStyle = "opacity:0.5;";

// This is enough top margin to accommodate the plotly options
// bar without it interfering with the first series in the
// legend.
export const margin = {
    t: 25
} as Partial<Margin>;

export const config = {
    responsive: true
};

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

export interface PlotlyOptions {
    includeLegendGroup: boolean;
    lineWidth: number;
    showLegend: boolean;
    dash: Dash | undefined;
}

const defaultPlotlyOptions = {
    includeLegendGroup: false,
    lineWidth: 2,
    showLegend: true
};

export function odinToPlotly(s: OdinSeriesSet, palette: Palette, options: Partial<PlotlyOptions> = {}): WodinPlotData {
    const plotlyOptions = {
        ...defaultPlotlyOptions,
        ...options
    };

    return s.values.map(
        (el): Partial<NumberArrayPlotData> => ({
            mode: "lines",
            line: {
                color: palette[el.name],
                width: plotlyOptions.lineWidth,
                dash: plotlyOptions.dash
            },
            name: el.name,
            x: s.x,
            y: el.y,
            hoverlabel: { namelength: -1 },
            legendgroup: plotlyOptions.includeLegendGroup ? el.name : undefined,
            showlegend: plotlyOptions.showLegend
        })
    );
}

export function discreteSeriesSetToPlotly(
    s: DiscreteSeriesSet,
    palette: Palette,
    showIndividualTraces: boolean
): WodinPlotData {
    const individualLegends: string[] = [];
    const series = showIndividualTraces ? s.values : s.values.filter((el) => el.description !== "Individual");
    return series.map((values: OdinSeriesSetValues) => {
        const isIndividual = values.description === "Individual";
        // show legend if not individual or if individual legend is not yet being shown
        let showlegend = true;
        if (isIndividual) {
            if (individualLegends.includes(values.name)) {
                showlegend = false;
            } else {
                individualLegends.push(values.name);
            }
        }
        const addDescription =
            values.description !== undefined && !isIndividual && values.description !== "Deterministic";
        const name = addDescription ? `${values.name} (${values.description!.toLowerCase()})` : values.name;
        return {
            mode: "lines",
            line: {
                color: palette[values.name],
                width: isIndividual ? 0.5 : undefined,
                opacity: isIndividual ? 0.5 : undefined
            },
            name,
            x: s.x,
            y: values.y,
            legendgroup: name,
            showlegend
        };
    });
}

export function fitDataToPlotly(
    data: FitData,
    link: FitDataLink,
    palette: Palette,
    start: number,
    end: number
): WodinPlotData {
    const filteredData = filterData(data, link.time, start, end);
    return [
        {
            name: link.data,
            x: filteredData.map((row: Dict<number>) => row[link.time]),
            y: filteredData.map((row: Dict<number>) => row[link.data]),
            mode: "markers",
            type: "scatter",
            marker: {
                color: palette[link.model]
            }
        }
    ];
}

export function allFitDataToPlotly(
    allFitData: AllFitData | null,
    paletteModel: Palette,
    start: number,
    end: number,
    selectedVariables: string[]
): WodinPlotData {
    if (!allFitData) {
        return [];
    }
    const { data, linkedVariables, timeVariable } = allFitData;
    const filteredData = filterData(data, timeVariable, start, end);
    const palette = paletteData(Object.keys(linkedVariables));

    return Object.keys(linkedVariables).map((name: string) => {
        let color = palette[name];
        const variable = linkedVariables[name];
        if (variable) {
            // If there is a linked variable, only show data if the variable is selected - if not selected, render the
            // series, but as transparent so that all graph x axes are consistent
            color = selectedVariables.includes(variable) ? paletteModel[variable] : "transparent";
        }
        return {
            name,
            x: filteredData.map((row: Dict<number>) => row[timeVariable]),
            y: filteredData.map((row: Dict<number>) => row[name]),
            mode: "markers",
            type: "scatter",
            marker: {
                color
            }
        };
    });
}

const lineStyles = ["dot", "dash", "longdash", "dashdot", "longdashdot"];
export const paramSetLineStyle = (index: number): string => lineStyles[index % lineStyles.length];

export const updatePlotTraceName = (
    plotTrace: Partial<PlotData>,
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
    // eslint-disable-next-line no-param-reassign
    plotTrace.name = `${plotTrace.name} (${parenthesisItems.join(" ")})`;
};
