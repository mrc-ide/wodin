export function parseColour(col: string): number[] {
    const r = parseInt(col.slice(1, 3), 16) / 255;
    const g = parseInt(col.slice(3, 5), 16) / 255;
    const b = parseInt(col.slice(5, 7), 16) / 255;
    return [r, g, b];
}

export function rgb(r: number, g: number, b: number): string {
    const roundcolour = (x: number) =>
        Math.round(Math.max(Math.min(x, 1), 0) * 255).toString(16);
    return `#${roundcolour(r)}${roundcolour(g)}${roundcolour(b)}`;
}

// TODO: cope with single colour case, I think it fails?
export function palette(pal: string[], len: number) {
    const cols = pal.map(parseColour);
    return (i: number): string => {
        const idx = i / (len - 1) * (cols.length - 1);
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
    }
}

export function paletteModel(names: string[]) {
    const cols = ["#2e5cb8", "#39ac73", "#cccc00", "#ff884d", "#cc0044"];
    const pal = palette(cols, names.length);
    return (name: string) => pal(names.indexOf(name));
}

export function paletteData(n: number) {
    // First few of these used, derived from ColorBrewer set 1
    const cols = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"];
    return (i: number): string => cols[i];
}
