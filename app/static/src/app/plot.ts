import { PlotData } from "plotly.js";
import { Palette } from "./palette";
import type { FitData, FitDataLink } from "./store/fitData/state";
import { OdinSeriesSet } from "./types/responseTypes";
import { Dict } from "./types/utilTypes";

export type WodinPlotData = Partial<PlotData>[];

export function filterSeriesSet(s: OdinSeriesSet, name: string): OdinSeriesSet {
    const idx = s.names.indexOf(name);
    return {
        names: [s.names[idx]],
        x: s.x,
        y: [s.y[idx]]
    };
}

export interface PlotlyOptions {
    includeLegendGroup: boolean,
    lineWidth: number
    showLegend: boolean
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

    return s.y.map(
        (el: number[], i: number): Partial<PlotData> => ({
            line: {
                color: palette[s.names[i]],
                width: plotlyOptions.lineWidth
            },
            name: s.names[i],
            x: s.x,
            y: s.y[i],
            legendgroup: plotlyOptions.includeLegendGroup ? s.names[i] : undefined,
            showlegend: plotlyOptions.showLegend
        })
    );
}

export function fitDataToPlotly(data: FitData, link: FitDataLink, palette: Palette, start: number,
    end: number): WodinPlotData {
    const filteredData = data.filter(
        (row: Dict<number>) => row[link.time] >= start && row[link.time] <= end
    );
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
