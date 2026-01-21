import {
    allFitDataToSkadiChart,
    discreteSeriesSetToSkadiChart,
    fitDataToSkadiChart,
    paramSetLineStyle,
    odinToSkadiChart
} from "../../src/plot";

describe("odinToSkadiChart", () => {
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
        expect(odinToSkadiChart(series, palette)).toStrictEqual([
            {
                metadata: {
                    color: "#ff0000",
                    name: "a",
                    tooltipName: "a"
                },
                points: [
                    { x: 0, y: 30 },
                    { x: 1, y: 40 }
                ],
                style: {
                    opacity: undefined,
                    strokeColor: "#ff0000",
                    strokeDasharray: undefined,
                    strokeWidth: 2
                }
            },
            {
                metadata: {
                    color: "#0000ff",
                    name: "b",
                    tooltipName: "b"
                },
                points: [
                    { x: 0, y: 50 },
                    { x: 1, y: 60 }
                ],
                style: {
                    opacity: undefined,
                    strokeColor: "#0000ff",
                    strokeDasharray: undefined,
                    strokeWidth: 2
                }
            }
        ]);
    });

    it("uses custom options", () => {
        const options = {
            strokeWidth: 3,
            strokeDasharray: "3"
        };

        expect(odinToSkadiChart(series, palette, options)).toStrictEqual([
            {
                metadata: {
                    color: "#ff0000",
                    name: "a",
                    tooltipName: "a"
                },
                points: [
                    { x: 0, y: 30 },
                    { x: 1, y: 40 }
                ],
                style: {
                    opacity: undefined,
                    strokeColor: "#ff0000",
                    strokeDasharray: "3",
                    strokeWidth: 3
                }
            },
            {
                metadata: {
                    color: "#0000ff",
                    name: "b",
                    tooltipName: "b"
                },
                points: [
                    { x: 0, y: 50 },
                    { x: 1, y: 60 }
                ],
                style: {
                    opacity: undefined,
                    strokeColor: "#0000ff",
                    strokeDasharray: "3",
                    strokeWidth: 3
                }
            }
        ]);
    });
});

const data = [
    { t: 0, a: 1, b: 2 },
    { t: 1, a: 2, b: 4 },
    { t: 2, a: 3, b: 6 },
    { t: 3, a: 4, b: 8 },
    { t: 4, a: 5, b: 10 }
];

const expectedStyleAndMetdata = (name: "a" | "b", overrideColor?: string) => {
    const color = overrideColor
      || (name === "a" ? "#1c0a00" : "#603601");

    return {
        metadata: {
            color,
            name,
            tooltipName: name
        },
        style: { color },
    };
};

const palette = {
    A: "#ff0000",
    B: "#0000ff"
};

describe("allFitDataToSkadiChart", () => {
    const allFitData = {
        data,
        linkedVariables: { a: null, b: null },
        timeVariable: "t"
    };

    it("creates unlinked data", () => {
        const res = allFitDataToSkadiChart(allFitData, palette, 0, 4, ["B"]);
        expect(res).toStrictEqual([
            ...data.map(dat => ({ ...expectedStyleAndMetdata("a"), x: dat.t, y: dat.a })),
            ...data.map(dat => ({ ...expectedStyleAndMetdata("b"), x: dat.t, y: dat.b })),
        ]);
    });

    it("returns empty set if data missing", () => {
        const res = allFitDataToSkadiChart(null, palette, 0, 4, ["B"]);
        expect(res).toStrictEqual([]);
    });

    it("filters data by time", () => {
        const res = allFitDataToSkadiChart(allFitData, palette, 1, 3, ["B"]);
        expect(res).toStrictEqual([
            ...data.filter(dat => dat.t >= 1 && dat.t <= 3)
              .map(dat => ({ ...expectedStyleAndMetdata("a"), x: dat.t, y: dat.a })),
            ...data.filter(dat => dat.t >= 1 && dat.t <= 3)
              .map(dat => ({ ...expectedStyleAndMetdata("b"), x: dat.t, y: dat.b })),
        ]);
    });

    it("adds model colours where possible", () => {
        const allFitDataLinked = {
            data,
            linkedVariables: { a: null, b: "B" },
            timeVariable: "t"
        };
        const selectedVariables = ["A", "B"];
        const res = allFitDataToSkadiChart(allFitDataLinked, palette, 0, 4, selectedVariables);
        expect(res).toStrictEqual([
            ...data.map(dat => ({ ...expectedStyleAndMetdata("a"), x: dat.t, y: dat.a })),
            ...data.map(dat => ({ ...expectedStyleAndMetdata("b", "#0000ff"), x: dat.t, y: dat.b })),
        ]);
    });

    it("adds transparent data for unselected variable", () => {
        const allFitDataLinked = {
            data,
            linkedVariables: { a: null, b: "B" },
            timeVariable: "t"
        };
        const selectedVariables = ["A"];
        const res = allFitDataToSkadiChart(allFitDataLinked, palette, 0, 4, selectedVariables);
        expect(res).toStrictEqual([
            ...data.map(dat => ({ ...expectedStyleAndMetdata("a"), x: dat.t, y: dat.a })),
            ...data.map(dat => ({ ...expectedStyleAndMetdata("b", "transparent"), x: dat.t, y: dat.b })),
        ]);
    });
});

describe("fitDataToSkadiChart", () => {
    const link = {
        time: "t",
        data: "a",
        model: "A"
    };

    it("creates series", () => {
        const res = fitDataToSkadiChart(data, link, palette, 0, 4);
        expect(res).toEqual([
            ...data.map(dat => ({ ...expectedStyleAndMetdata("a", "#ff0000"), x: dat.t, y: dat.a })),
        ]);
    });
});

describe("discreteSeriesSetToSkadiChart", () => {
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
        const res = discreteSeriesSetToSkadiChart(seriesSet, palette, true);
        expect(res).toStrictEqual([
            {
                metadata: {
                    color: "#ff0000",
                    name: "A",
                    tooltipName: "A"
                },
                points: [
                    { x: 0, y: 1 },
                    { x: 1, y: 2 },
                    { x: 2, y: 3 }
                ],
                style: {
                    opacity: 0.5,
                    strokeColor: "#ff0000",
                    strokeWidth: 0.5
                }
            },
            {
                metadata: {
                    color: "#ff0000",
                    name: "A",
                    tooltipName: "A"
                },
                points: [
                    { x: 0, y: 4 },
                    { x: 1, y: 5 },
                    { x: 2, y: 6 }
                ],
                style: {
                    opacity: 0.5,
                    strokeColor: "#ff0000",
                    strokeWidth: 0.5
                }
            },
            {
                metadata: {
                    color: "#ff0000",
                    name: "A (mean)",
                    tooltipName: "A (mean)"
                },
                points: [
                    { x: 0, y: 7 },
                    { x: 1, y: 8 },
                    { x: 2, y: 9 }
                ],
                style: {
                    opacity: 1,
                    strokeColor: "#ff0000",
                    strokeWidth: 2
                }
            },
            {
                metadata: {
                    color: "#0000ff",
                    name: "B",
                    tooltipName: "B"
                },
                points: [
                    { x: 0, y: 10 },
                    { x: 1, y: 11 },
                    { x: 2, y: 12 }
                ],
                style: {
                    opacity: 1,
                    strokeColor: "#0000ff",
                    strokeWidth: 2
                }
            }
        ]);
    });

    it("creates expected series if individual traces are off", () => {
        const seriesSet = {
            x: [0, 1, 2],
            values: [
                { name: "A", description: "Individual", y: [1, 2, 3] },
                { name: "A", description: "Individual", y: [4, 5, 6] },
                { name: "A", description: "Mean", y: [7, 8, 9] },
                { name: "B", description: "Deterministic", y: [10, 11, 12] }
            ]
        };
        const res = discreteSeriesSetToSkadiChart(seriesSet, palette, false);
        expect(res).toStrictEqual([
            {
                metadata: {
                    color: "#ff0000",
                    name: "A (mean)",
                    tooltipName: "A (mean)"
                },
                points: [
                    { x: 0, y: 7 },
                    { x: 1, y: 8 },
                    { x: 2, y: 9 }
                ],
                style: {
                    opacity: 1,
                    strokeColor: "#ff0000",
                    strokeWidth: 2
                }
            },
            {
                metadata: {
                    color: "#0000ff",
                    name: "B",
                    tooltipName: "B"
                },
                points: [
                    { x: 0, y: 10 },
                    { x: 1, y: 11 },
                    { x: 2, y: 12 }
                ],
                style: {
                    opacity: 1,
                    strokeColor: "#0000ff",
                    strokeWidth: 2
                }
            }
        ]);
    });
});

describe("paramSetLineStyle", () => {
    it("fetches expected line styles", () => {
        // check we are looping around after 5th line style
        expect(paramSetLineStyle(0)).toBe(paramSetLineStyle(5));
    });
});
