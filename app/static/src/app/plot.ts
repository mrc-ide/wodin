import { PlotData } from "plotly.js";
import { Palette } from "./palette";
import { OdinSeriesSet } from "./types/responseTypes";

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
            mode: "lines",
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
