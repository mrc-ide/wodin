import { Palette } from "./palette";
import { OdinSeriesSet } from "./types/responseTypes";

export type WodinPlotData = Partial<PlotData>[];
export type AllPlotData = (t0: number, t1: number) => WodinPlotData;

export function filterSeriesSet(s: OdinSeriesSet, name: string): OdinSeriesSet {
    const idx = s.names.indexOf(name);
    return {
        names: [s.names[idx]],
        x: s.x,
        y: [s.y[idx]]
    };
}

export function odinToPlotly(s: OdinSeriesSet, palette: Palette): WodinPlotData {
    return s.y.map(
        (el: number[], i: number): Partial<PlotData> => ({
            line: { color: palette[variable] },
            name: s.names[i],
            x: s.x,
            y: s.y[i]
        })
    );
}
