import {Dash, PlotData} from "plotly.js-basic-dist-min";
import { Palette, paletteData } from "./palette";
import type { AllFitData, FitData, FitDataLink } from "./store/fitData/state";
import {
    DiscreteSeriesSet, OdinSeriesSet, OdinSeriesSetValues
} from "./types/responseTypes";
import { Dict } from "./types/utilTypes";

export type WodinPlotData = Partial<PlotData>[];

export const fadePlotStyle = "opacity:0.5;";

// This is enough top margin to accommodate the plotly options
// bar without it interfering with the first series in the
// legend.
export const margin = {
    t: 25
};

export const config = {
    responsive: true
};

export function filterSeriesSet(s: OdinSeriesSet, name: string): OdinSeriesSet {
    const idx = s.values.findIndex((el) => el.name === name);
    const { y } = s.values[idx];
    return {
        x: s.x,
        values: [{ name, y }]
    };
}

function filterData(data: FitData, timeVariable: string, start: number, end: number) {
    return data.filter(
        (row: Dict<number>) => row[timeVariable] >= start && row[timeVariable] <= end
    );
}

export interface PlotlyOptions {
    includeLegendGroup: boolean,
    lineWidth: number
    showLegend: boolean
    dash: Dash | undefined
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
        (el): Partial<PlotData> => ({
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

export function discreteSeriesSetToPlotly(s: DiscreteSeriesSet, palette: Palette): WodinPlotData {
    const individualLegends: string[] = [];
    return s.values.map(
        (values: OdinSeriesSetValues) => {
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
            const addDescription = values.description !== undefined
                && !isIndividual
                && values.description !== "Deterministic";
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
        }
    );
}

export function fitDataToPlotly(data: FitData, link: FitDataLink, palette: Palette, start: number,
    end: number): WodinPlotData {
    const filteredData = filterData(data, link.time, start, end);
    return [{
        name: link.data,
        x: filteredData.map((row: Dict<number>) => row[link.time]),
        y: filteredData.map((row: Dict<number>) => row[link.data]),
        mode: "markers",
        type: "scatter",
        marker: {
            color: palette[link.model]
        }
    }];
}

export function allFitDataToPlotly(allFitData: AllFitData | null, paletteModel: Palette,
    start: number, end: number): WodinPlotData {
    if (!allFitData) {
        return [];
    }
    const {
        data, linkedVariables, timeVariable
    } = allFitData;
    const filteredData = filterData(data, timeVariable, start, end);
    const palette = paletteData(Object.keys(linkedVariables));
    return Object.keys(linkedVariables).map((name: string) => ({
        name,
        x: filteredData.map((row: Dict<number>) => row[timeVariable]),
        y: filteredData.map((row: Dict<number>) => row[name]),
        mode: "markers",
        type: "scatter",
        marker: {
            color: linkedVariables[name] ? paletteModel[linkedVariables[name]!] : palette[name]
        }
    }));
}

const lineStyles = ["dot", "dash", "longdash", "dashdot", "longdashdot"];
export const lineStyleForParameterSetIndex = (index: number): string => (lineStyles[index % lineStyles.length]);