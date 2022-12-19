import {
    allFitDataToPlotly, discreteSeriesSetToPlotly,
    fitDataToPlotly, lineStyleForParameterSetIndex,
    odinToPlotly
} from "../../src/app/plot";

describe("odinToPlotly", () => {
    const palette = {
        a: "#ff0000",
        b: "#0000ff"
    };

    const series = {
        x: [0, 1],
        values: [
            { name: "a", y: [30, 40] },
            { name: "b", y: [50, 60] }
        ]
    };

    it("uses default options", () => {
        expect(odinToPlotly(series, palette)).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2
                },
                name: "a",
                x: [0, 1],
                y: [30, 40],
                hoverlabel: { namelength: -1 },
                legendgroup: undefined,
                showlegend: true
            },
            {
                mode: "lines",
                line: {
                    color: "#0000ff",
                    width: 2
                },
                name: "b",
                x: [0, 1],
                y: [50, 60],
                hoverlabel: { namelength: -1 },
                legendgroup: undefined,
                showlegend: true
            }
        ]);
    });

    it("uses custom options", () => {
        const options = {
            includeLegendGroup: true,
            lineWidth: 3,
            showLegend: false
        };

        expect(odinToPlotly(series, palette, options)).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 3
                },
                name: "a",
                x: [0, 1],
                y: [30, 40],
                hoverlabel: { namelength: -1 },
                legendgroup: "a",
                showlegend: false
            },
            {
                mode: "lines",
                line: {
                    color: "#0000ff",
                    width: 3
                },
                name: "b",
                x: [0, 1],
                y: [50, 60],
                hoverlabel: { namelength: -1 },
                legendgroup: "b",
                showlegend: false
            }
        ]);
    });
});

describe("allFitDataToPlotly", () => {
    const palette = {
        A: "#ff0000",
        B: "#0000ff"
    };
    const data = [
        { t: 0, a: 1, b: 2 },
        { t: 1, a: 2, b: 4 },
        { t: 2, a: 3, b: 6 },
        { t: 3, a: 4, b: 8 },
        { t: 4, a: 5, b: 10 }
    ];
    const allFitData = {
        data,
        linkedVariables: { a: null, b: null },
        timeVariable: "t"
    };

    it("creates unlinked data", () => {
        const res = allFitDataToPlotly(allFitData, palette, 0, 4);
        expect(res).toStrictEqual([
            {
                marker: { color: "#1c0a00" }, // first data colour
                mode: "markers",
                name: "a",
                type: "scatter",
                x: [0, 1, 2, 3, 4],
                y: [1, 2, 3, 4, 5]
            },
            {
                marker: { color: "#603601" }, // second data colour
                mode: "markers",
                name: "b",
                type: "scatter",
                x: [0, 1, 2, 3, 4],
                y: [2, 4, 6, 8, 10]
            }
        ]);
    });

    it("returns empty set if data missing", () => {
        const res = allFitDataToPlotly(null, palette, 0, 4);
        expect(res).toStrictEqual([]);
    });

    it("filters data by time", () => {
        const res = allFitDataToPlotly(allFitData, palette, 1, 3);
        expect(res).toStrictEqual([
            {
                marker: { color: "#1c0a00" },
                mode: "markers",
                name: "a",
                type: "scatter",
                x: [1, 2, 3],
                y: [2, 3, 4]
            },
            {
                marker: { color: "#603601" },
                mode: "markers",
                name: "b",
                type: "scatter",
                x: [1, 2, 3],
                y: [4, 6, 8]
            }
        ]);
    });

    it("adds model colours where possible", () => {
        const allFitDataLinked = {
            data,
            linkedVariables: { a: null, b: "B" },
            timeVariable: "t"
        };
        const res = allFitDataToPlotly(allFitDataLinked, palette, 0, 4);
        expect(res).toStrictEqual([
            {
                marker: { color: "#1c0a00" }, // first data colour
                mode: "markers",
                name: "a",
                type: "scatter",
                x: [0, 1, 2, 3, 4],
                y: [1, 2, 3, 4, 5]
            },
            {
                marker: { color: "#0000ff" }, // Model colour
                mode: "markers",
                name: "b",
                type: "scatter",
                x: [0, 1, 2, 3, 4],
                y: [2, 4, 6, 8, 10]
            }
        ]);
    });
});

describe("fitDataToPlotly", () => {
    const palette = {
        A: "#ff0000",
        B: "#0000ff"
    };
    const data = [
        { t: 0, a: 1, b: 2 },
        { t: 1, a: 2, b: 4 },
        { t: 2, a: 3, b: 6 },
        { t: 3, a: 4, b: 8 },
        { t: 4, a: 5, b: 10 }
    ];
    const link = {
        time: "t",
        data: "a",
        model: "A"
    };
    it("creates series", () => {
        const res = fitDataToPlotly(data, link, palette, 0, 4);
        expect(res).toEqual([{
            marker: { color: "#ff0000" },
            mode: "markers",
            name: "a",
            type: "scatter",
            x: [0, 1, 2, 3, 4],
            y: [1, 2, 3, 4, 5]
        }]);
    });
});

describe("discreteSeriesSetToPlotly", () => {
    const palette = {
        A: "#ff0000",
        B: "#0000ff"
    };

    it("creates expected series", () => {
        const seriesSet = {
            x: [0, 1, 2],
            values: [
                { name: "A", description: "Individual", y: [1, 2, 3] },
                { name: "A", description: "Individual", y: [4, 5, 6] },
                { name: "A", description: "Mean", y: [7, 8, 9] },
                { name: "B", description: "Deterministic", y: [10, 11, 12] }
            ]
        };
        const res = discreteSeriesSetToPlotly(seriesSet, palette);
        expect(res).toStrictEqual([
            {
                mode: "lines",
                line: { color: "#ff0000", width: 0.5, opacity: 0.5 },
                name: "A",
                x: [0, 1, 2],
                y: [1, 2, 3],
                legendgroup: "A",
                showlegend: true
            },
            {
                mode: "lines",
                line: { color: "#ff0000", width: 0.5, opacity: 0.5 },
                name: "A",
                x: [0, 1, 2],
                y: [4, 5, 6],
                legendgroup: "A",
                showlegend: false
            },
            {
                mode: "lines",
                line: { color: "#ff0000", width: undefined, opacity: undefined },
                name: "A (mean)",
                x: [0, 1, 2],
                y: [7, 8, 9],
                legendgroup: "A (mean)",
                showlegend: true
            },
            {
                mode: "lines",
                line: { color: "#0000ff", width: undefined, opacity: undefined },
                name: "B",
                x: [0, 1, 2],
                y: [10, 11, 12],
                legendgroup: "B",
                showlegend: true
            }
        ]);
    });
});

describe("lineStyleForParameterSetIndex", () => {
    it("fetches expected line styles", () => {
        expect(lineStyleForParameterSetIndex(0)).toBe("dot");
        expect(lineStyleForParameterSetIndex(1)).toBe("dash");
        expect(lineStyleForParameterSetIndex(2)).toBe("longdash");
        expect(lineStyleForParameterSetIndex(3)).toBe("dashdot");
        expect(lineStyleForParameterSetIndex(4)).toBe("longdashdot");
        expect(lineStyleForParameterSetIndex(5)).toBe("dot");
    });
});
