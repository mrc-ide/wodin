import { interpolateColours, paletteData, paletteModel, parseColour, rgb } from "../../src/app/palette";

describe("parse colours", () => {
    it("can roundtrip", () => {
        const parsed = parseColour("#abcdef");
        expect(parsed).toEqual([171 / 255, 205 / 255, 239 / 255]);
        expect(rgb(parsed[0], parsed[1], parsed[2])).toEqual("#abcdef");
    });

    it("pads colour strings with 0s if necessary", () => {
        const r = 1 / 255;
        const g = 15 / 255;
        const b = 16 / 255;
        expect(rgb(r, g, b)).toEqual("#010f10");
    });
});

describe("interpolate colours", () => {
    const cols = ["#2e5cb8", "#39ac73", "#cccc00", "#ff884d", "#cc0044"];
    it("returns exact solutions", () => {
        const p = interpolateColours(cols, cols.length);
        for (let i = 0; i < cols.length; i += 1) {
            expect(p(i)).toEqual(cols[i]);
        }
    });

    it("interpolates down", () => {
        const p = interpolateColours(cols, 4);
        const res = [p(0), p(1), p(2), p(3)];
        expect(p(0)).toEqual(cols[0]); // lower bound
        expect(p(3)).toEqual(cols[4]); // upper bound
        expect(p(1)).toEqual("#6ab74d");
        expect(p(2)).toEqual("#ee9f33");
    });

    it("interpolates up", () => {
        const p = interpolateColours(cols, 9);
        const res = [];
        for (let i = 0; i < 9; i += 1) {
            res.push(p(i));
        }
        const expected = [
            "#2e5cb8",
            "#348496",
            "#39ac73",
            "#83bc3a",
            "#cccc00",
            "#e6aa27",
            "#ff884d",
            "#e64449",
            "#cc0044"
        ];
        expect(res).toEqual(expected);
    });
});

describe("create palettes", () => {
    it("creates palettes for model", () => {
        const pal = paletteModel(["a", "b", "c", "d"]);
        expect(pal).toEqual({
            a: "#2e5cb8",
            b: "#6ab74d",
            c: "#ee9f33",
            d: "#cc0044"
        });
    });

    it("creates palettes for data", () => {
        const pal = paletteData(["a", "b", "c"]);
        expect(pal).toEqual({
            a: "#1c0a00",
            b: "#603601",
            c: "#cc9544"
        });
    });

    it("allows single-variable palette", () => {
        expect(paletteModel(["a"])).toEqual({ a: "#2e5cb8" });
    });

    it("allows zero-variable palette", () => {
        expect(paletteModel([])).toEqual({});
    });
});
