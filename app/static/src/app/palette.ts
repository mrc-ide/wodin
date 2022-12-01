import { Dict } from "./types/utilTypes";

export type Palette = Dict<string>;

export function parseColour(col: string): number[] {
    const r = parseInt(col.slice(1, 3), 16) / 255;
    const g = parseInt(col.slice(3, 5), 16) / 255;
    const b = parseInt(col.slice(5, 7), 16) / 255;
    return [r, g, b];
}

export function rgb(r: number, g: number, b: number): string {
    const roundcolour = (x: number) => Math.round(Math.max(Math.min(x, 1), 0) * 255).toString(16).padStart(2, "0");
    return `#${roundcolour(r)}${roundcolour(g)}${roundcolour(b)}`;
}

export function interpolateColours(pal: string[], len: number): (i: number) => string {
    const cols = pal.map(parseColour);
    return (i: number): string => {
        const idx = (i / (len - 1)) * (cols.length - 1);
        const lo = Math.floor(idx);
        const p = idx % 1;
        if (lo >= cols.length - 1) {
            return pal[cols.length - 1];
        }
        if (p === 0) {
            return pal[lo];
        }
        const r = cols[lo][0] * (1 - p) + cols[lo + 1][0] * p;
        const g = cols[lo][1] * (1 - p) + cols[lo + 1][1] * p;
        const b = cols[lo][2] * (1 - p) + cols[lo + 1][2] * p;
        return rgb(r, g, b);
    };
}

export function paletteModel(names: string[]): Palette {
    const cols = ["#2e5cb8", "#39ac73", "#cccc00", "#ff884d", "#cc0044"];
    const ret: Palette = {};
    if (names.length === 1) {
        const col = cols[0];
        ret[names[0]] = col;
    } else if (names.length > 0) {
        const pal = interpolateColours(cols, names.length);
        names.forEach((el: string, index: number) => {
            ret[el] = pal(index);
        });
    }
    return ret;
}

export function paletteData(names: string[]): Palette {
    // This is not a lot of colours, but we don't really expect that
    // many columns to come in here (if a user is adding more than 3
    // columns we might want some interface to filter down to
    // interesting ones, we will also bail on any non-numeric column).
    //
    // These are all brownish so that the colours will contrast nicely
    // with the model series (a rainbow, above)
    const cols = ["#1c0a00", "#603601", "#cc9544"];
    const ret: Palette = {};
    names.forEach((el: string, index: number) => {
        ret[el] = cols[index];
    });
    return ret;
}
