import {odinToPlotly} from "../../src/app/plot";

describe("odinToPlotly", () => {
    const palette = {
        a: "#ff0000",
        b: "#0000ff"
    };

    const series = {
        names: ["a", "b"],
        x: [0, 1],
        y: [[30, 40], [50, 60]]
    };

    it("uses default options", () => {
        expect(odinToPlotly(series, palette)).toStrictEqual([
            {
                line: {
                    color: "#ff0000",
                    width: 2
                },
                name: "a",
                x: [0, 1],
                y: [30, 40],
                legendgroup: undefined,
                showlegend: true
            },
            {
                line: {
                    color: "#0000ff",
                    width: 2
                },
                name: "b",
                x: [0, 1],
                y: [50, 60],
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
                line: {
                    color: "#ff0000",
                    width: 3
                },
                name: "a",
                x: [0, 1],
                y: [30, 40],
                legendgroup: "a",
                showlegend: false
            },
            {
                line: {
                    color: "#0000ff",
                    width: 3
                },
                name: "b",
                x: [0, 1],
                y: [50, 60],
                legendgroup: "b",
                showlegend: false
            }
        ]);
    });
});
