import {
    evaluateScript,
    freezer,
    generateBatchPars,
    getCodeErrorFromResponse,
    processFitData,
    newUid,
    joinStringsSentence,
    parseDateTime
} from "../../src/utils";
import { SensitivityScaleType, SensitivityVariationType } from "../../src/store/sensitivity/state";
import { mockBatchParsDisplace, mockBatchParsRange } from "../mocks";

describe("freezer", () => {
    it("deep freezes an object", () => {
        const data = {
            nothing: null,
            time: 10,
            name: "hello",
            items: [1, null, "three", { label: "l1" }],
            child: {
                name: "child",
                items: [4, null, "five"]
            }
        };

        const frozen = freezer.deepFreeze({ ...data }) as any;
        expect(frozen).toStrictEqual(data);
        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.items)).toBe(true);
        expect(Object.isFrozen(frozen.child)).toBe(true);
        expect(Object.isFrozen(frozen.child.items)).toBe(true);
    });

    it("deep freezes an array", () => {
        const data = [{ id: 1 }, { child: { id: 2 } }, 1, "hi"];

        const frozen = freezer.deepFreeze([...data]) as any;
        expect(frozen).toStrictEqual(data);
        expect(Object.isFrozen(frozen[0])).toBe(true);
        expect(Object.isFrozen(frozen[1].child)).toBe(true);
    });
});

describe("evaluateScript", () => {
    it("evals as type", () => {
        const fn = evaluateScript<(n: number) => number>("(n) => n+3");
        expect(fn(2)).toBe(5);
    });
});

describe("processFitData", () => {
    const noTimeVariableDetail =
        "Data contains no suitable time variable." +
        " A time variable must strictly increase per row, with no negative values.";
    it("processes numeric data without errors", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" },
            { a: "9", b: "10" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.error).toBe(undefined);
        expect(result.data).toStrictEqual([
            { a: 1, b: 2 },
            { a: 3.5, b: -100 },
            { a: 5, b: 6 },
            { a: 7, b: 8 },
            { a: 9, b: 10 }
        ]);
        expect(result.timeVariableCandidates).toStrictEqual(["a"]);
    });

    it("returns error if less than 5 rows", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "File must contain at least 5 data rows."
        });
    });

    it("returns error if less than 2 columns", () => {
        const data = [{ a: "1" }, { a: "3.5" }, { a: "5" }, { a: "7" }, { a: "10" }];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "File must contain at least 2 columns."
        });
    });

    it("returns error with 3 or fewer non-numeric values", () => {
        const data = [
            { a: "one", b: "two" },
            { a: "3", b: "4" },
            { a: "5", b: "six" },
            { a: "7", b: "8" },
            { a: "9", b: "10" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "Data contains non-numeric values: 'one', 'two', 'six'"
        });
    });

    it("returns error with first 3 non-numeric values if there are more than this", () => {
        const data = [
            { a: "one", b: "two" },
            { a: "3", b: "four" },
            { a: "5", b: "six" },
            { a: "7", b: "8" },
            { a: "9", b: "10" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "Data contains non-numeric values: 'one', 'two', 'four' and more"
        });
    });

    it("returns error if no candidate time variables", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3", b: "4" },
            { a: "5", b: "6" },
            { a: "7", b: "5" },
            { a: "-21", b: "10" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: noTimeVariableDetail
        });
    });

    it("allows missing values in data columns", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "" },
            { a: "5", b: "20" },
            { a: "7", b: "NA" },
            { a: "9", b: "10" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.error).toBe(undefined);
        expect(result.data).toStrictEqual([
            { a: 1, b: 2 },
            { a: 3.5, b: NaN },
            { a: 5, b: 20 },
            { a: 7, b: NaN },
            { a: 9, b: 10 }
        ]);
        expect(result.timeVariableCandidates).toStrictEqual(["a"]);
    });

    it("disallows columns with missing values as time variables", () => {
        // both are increasing here
        const data = [
            { a: "1", b: "2" },
            { a: "2", b: "3" },
            { a: "5", b: "4.5" },
            { a: "NA", b: "7" },
            { a: "9", b: "" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: noTimeVariableDetail
        });
    });

    it("disallows columns with negative values as time variables", () => {
        const data = [
            { a: "-1", b: "2" },
            { a: "2", b: "3" },
            { a: "5", b: "4.5" },
            { a: "6", b: "7" },
            { a: "9", b: "1" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: noTimeVariableDetail
        });
    });

    it("strips trailing blank rows", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" },
            { a: "9", b: "10" },
            { a: "", b: "" },
            { a: "", b: "" },
            { a: "", b: "" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.error).toBe(undefined);
        expect(result.data).toStrictEqual([
            { a: 1, b: 2 },
            { a: 3.5, b: -100 },
            { a: 5, b: 6 },
            { a: 7, b: 8 },
            { a: 9, b: 10 }
        ]);
        expect(result.timeVariableCandidates).toStrictEqual(["a"]);
    });

    it("returns error if less than 5 rows, after stripping blanks", () => {
        const data = [
            { a: "1", b: "2" },
            { a: "3.5", b: "-100" },
            { a: "5", b: "6" },
            { a: "7", b: "8" },
            { a: "", b: "" },
            { a: "", b: "" },
            { a: "", b: "" },
            { a: "", b: "" }
        ];
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "File must contain at least 5 data rows."
        });
    });

    it("copes with pathalogical empty csv", () => {
        const data = Array(5).fill({ a: "", b: "" });
        const result = processFitData(data, "Error occurred");
        expect(result.data).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Error occurred",
            detail: "File must contain at least 5 data rows."
        });
    });

    it("can get code error from model response", () => {
        const error = {
            line: [],
            message: "a test message"
        };
        const transformedError = getCodeErrorFromResponse(error);

        expect(transformedError).toStrictEqual({
            error: "Code error",
            detail: error.message
        });
    });

    it("can get code error with null line array from model response", () => {
        const error = {
            line: null,
            message: "a test message"
        } as any;
        const transformedError = getCodeErrorFromResponse(error);

        expect(transformedError).toStrictEqual({
            error: "Code error",
            detail: error.message
        });
    });

    it("can get code error with a single line number from model response", () => {
        const error = {
            line: [1],
            message: "a test message"
        };
        const transformedError = getCodeErrorFromResponse(error);

        expect(transformedError).toStrictEqual({
            error: "Code error",
            detail: `Error on line 1: ${error.message}`
        });
    });

    it("can get code error with multiple line numbers from model response", () => {
        const error = {
            line: [1, 2],
            message: "a test message"
        };
        const transformedError = getCodeErrorFromResponse(error);

        expect(transformedError).toStrictEqual({
            error: "Code error",
            detail: `Error on lines 1,2: ${error.message}`
        });
    });
});

describe("generateBatchPars", () => {
    const parameterValues = { A: 1, B: 2, C: 3 };

    const rootState = {
        model: {
            odinRunnerOde: {
                batchParsRange: mockBatchParsRange,
                batchParsDisplace: mockBatchParsDisplace
            }
        },
        run: {
            parameterValues
        }
    } as any;

    const spyBatchParsRange = vi.spyOn(rootState.model.odinRunnerOde, "batchParsRange");
    const spyBatchParsDisplace = vi.spyOn(rootState.model.odinRunnerOde, "batchParsDisplace");

    afterEach(() => {
        vi.clearAllMocks();
    });

    const percentSettings = {
        parameterToVary: "A",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 50,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5,
        customValues: []
    };

    const rangeSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Range,
        variationPercentage: 50,
        rangeFrom: 2,
        rangeTo: 6,
        numberOfRuns: 9,
        customValues: []
    };

    const customSettings = {
        parameterToVary: "C",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Custom,
        variationPercentage: 50,
        rangeFrom: 2,
        rangeTo: 6,
        numberOfRuns: 9,
        customValues: [1, 2, 3]
    };

    it("generates BatchPars for Percentage variation type", () => {
        const result = generateBatchPars(rootState, [percentSettings], parameterValues)!;
        expect(result.error).toBe(null);
        expect(result.batchPars!.base).toBe(parameterValues);
        expect(result.batchPars!.varying).toStrictEqual([
            {
                name: "A",
                values: [0.5, 0.75, 1, 1.25, 1.5]
            }
        ]);

        expect(spyBatchParsDisplace).toHaveBeenCalledTimes(1);
        expect(spyBatchParsDisplace.mock.calls[0][0]).toStrictEqual(parameterValues);
        expect(spyBatchParsDisplace.mock.calls[0][1]).toStrictEqual("A");
        expect(spyBatchParsDisplace.mock.calls[0][2]).toStrictEqual(5);
        expect(spyBatchParsDisplace.mock.calls[0][3]).toStrictEqual(true);
        expect(spyBatchParsDisplace.mock.calls[0][4]).toStrictEqual(50);
    });

    it("generates BatchPars for Range variation type", () => {
        const result = generateBatchPars(rootState, [rangeSettings], parameterValues)!;
        expect(result.error).toBe(null);
        expect(result.batchPars!.base).toBe(parameterValues);
        expect(result.batchPars!.varying).toStrictEqual([
            {
                name: "B",
                values: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
            }
        ]);
        expect(spyBatchParsRange).toHaveBeenCalledTimes(1);
        expect(spyBatchParsRange.mock.calls[0][0]).toStrictEqual(parameterValues);
        expect(spyBatchParsRange.mock.calls[0][1]).toStrictEqual("B");
        expect(spyBatchParsRange.mock.calls[0][2]).toStrictEqual(9);
        expect(spyBatchParsRange.mock.calls[0][3]).toStrictEqual(false);
        expect(spyBatchParsRange.mock.calls[0][4]).toStrictEqual(2);
        expect(spyBatchParsRange.mock.calls[0][5]).toStrictEqual(6);
    });

    it("generates BatchPars for Custom variation type", () => {
        const result = generateBatchPars(rootState, [customSettings], parameterValues)!;
        expect(result.error).toBe(null);
        expect(result.batchPars!.base).toBe(parameterValues);
        expect(result.batchPars!.varying).toStrictEqual([
            {
                name: "C",
                values: [1, 2, 3]
            }
        ]);
        expect(spyBatchParsDisplace).not.toHaveBeenCalled();
        expect(spyBatchParsRange).not.toHaveBeenCalled();
    });

    it("generates BatchPars for multiple param settings", () => {
        const result = generateBatchPars(rootState, [customSettings, rangeSettings, percentSettings], parameterValues)!;
        expect(result.error).toBe(null);
        expect(result.batchPars!.base).toBe(parameterValues);
        expect(result.batchPars!.varying).toStrictEqual([
            { name: "C", values: [1, 2, 3] },
            { name: "B", values: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6] },
            { name: "A", values: [0.5, 0.75, 1, 1.25, 1.5] }
        ]);
    });

    const expectedNotInitialisedError = { error: "Invalid settings", detail: "Model is not initialised" };

    it("returns error if no runner in state", () => {
        const noRunnerState = {
            model: {
                odinRunnerOde: null
            },
            run: {
                parameterValues
            }
        } as any;
        const result = generateBatchPars(noRunnerState, [percentSettings], parameterValues);
        expect(result.batchPars).toBe(null);
        expect(result.error).toStrictEqual(expectedNotInitialisedError);
    });

    it("returns error if no param values in state", () => {
        const noParamsState = {
            model: {
                odinRunnerOde: rootState.model.odinRunnerOde
            },
            run: {
                parameterValues: null
            }
        } as any;
        const result = generateBatchPars(noParamsState, [rangeSettings], null);
        expect(result.batchPars).toBe(null);
        expect(result.error).toStrictEqual(expectedNotInitialisedError);
        expect(spyBatchParsRange).not.toHaveBeenCalled();
    });

    it("returns error if no param to vary in settings", () => {
        const settings = { ...percentSettings, parameterToVary: null };
        const result = generateBatchPars(rootState, [settings], parameterValues);
        expect(result.batchPars).toBe(null);
        expect(result.error).toStrictEqual({ error: "Invalid settings", detail: "Parameter to vary is not set" });
        expect(spyBatchParsDisplace).not.toHaveBeenCalled();
    });

    it("returns error if batchParsRange throws error", () => {
        const settings = { ...rangeSettings, rangeFrom: 0, rangeTo: 0 };
        const result = generateBatchPars(rootState, [settings], parameterValues);
        expect(result.batchPars).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Invalid settings",
            detail: "Mock error: min must be less than max"
        });
        expect(spyBatchParsRange).toHaveBeenCalledTimes(1);
    });

    it("returns error if batchParsDisplace throws error", () => {
        const settings = { ...percentSettings, numberOfRuns: 0 };
        const result = generateBatchPars(rootState, [settings], parameterValues);
        expect(result.batchPars).toBe(null);
        expect(result.error).toStrictEqual({
            error: "Invalid settings",
            detail: "Mock error: count must be 2 or more"
        });
        expect(spyBatchParsDisplace).toHaveBeenCalledTimes(1);
    });
});

describe("newSessionId", () => {
    it("generates expected id format", () => {
        const id = newUid();
        expect(id).toMatch(/^[a-z0-9]{32}$/);
    });
});

describe("join strings", () => {
    it("handles empty corner case", () => {
        expect(joinStringsSentence([])).toBe("");
    });
    it("handles single corner case", () => {
        expect(joinStringsSentence(["x"])).toBe("x");
    });
    it("handles pair", () => {
        expect(joinStringsSentence(["x", "y"])).toBe("x and y");
    });
    it("handles longer list", () => {
        expect(joinStringsSentence(["a", "b", "c", "d"], ", and ")).toBe("a, b, c, and d");
    });
});

describe("parseDateTime works as expected", () => {
    it("works with short datetimes", () => {
        const shortDate = new Date("1/2/24 3:4:5");
        const { year, month, day, hour, minute, second } = parseDateTime(shortDate);
        expect(month).toBe("01");
        expect(day).toBe("02");
        expect(year).toBe(2024);
        expect(hour).toBe("03");
        expect(minute).toBe("04");
        expect(second).toBe("05");
    });

    it("works with long datetimes", () => {
        const shortDate = new Date("11/12/24 13:14:15");
        const { year, month, day, hour, minute, second } = parseDateTime(shortDate);
        expect(month).toBe("11");
        expect(day).toBe("12");
        expect(year).toBe(2024);
        expect(hour).toBe("13");
        expect(minute).toBe("14");
        expect(second).toBe("15");
    });
});
