import { mutations } from "../../../../src/app/store/run/mutations";
import { AdvancedOptions } from "../../../../src/app/store/run/state";
import { mockRunState } from "../../../mocks";

describe("Run mutations", () => {
    const noRunRequired = {
        endTimeChanged: false,
        modelChanged: false,
        parameterValueChanged: false,
        numberOfReplicatesChanged: false,
        advancedSettingsChanged: false
    };

    it("sets result ode", () => {
        const mockSolution = () => [{ x: 1, y: 2 }];
        const state = mockRunState({
            runRequired: {
                endTimeChanged: false,
                modelChanged: true,
                parameterValueChanged: true,
                numberOfReplicatesChanged: false,
                advancedSettingsChanged: false
            }
        });
        const result = {
            inputs: { endTime: 99, parameterValues: { a: 1 } },
            error: null,
            solution: mockSolution
        };

        mutations.SetResultOde(state, result);
        expect(state.resultOde).toBe(result);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("sets result discrete", () => {
        const mockSeriesSet = { values: [] } as any;
        const state = mockRunState({
            runRequired: {
                endTimeChanged: false,
                modelChanged: true,
                parameterValueChanged: true,
                numberOfReplicatesChanged: false,
                advancedSettingsChanged: false
            }
        });
        const result = {
            inputs: { endTime: 99, parameterValues: { a: 1 } },
            error: null,
            seriesSet: mockSeriesSet
        };

        mutations.SetResultDiscrete(state, result);
        expect(state.resultDiscrete).toBe(result);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("sets run required", () => {
        const state = mockRunState();
        mutations.SetRunRequired(state, { modelChanged: true });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: true,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
        mutations.SetRunRequired(state, { modelChanged: false });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("sets parameter values", () => {
        const state = mockRunState();
        const parameters = { p1: 1, p2: 2 };
        mutations.SetParameterValues(state, parameters);
        expect(state.parameterValues).toBe(parameters);
    });

    it("updates parameter values and sets runRequired to true", () => {
        const state = mockRunState({
            parameterValues: { p1: 1, p2: 2 },
            runRequired: noRunRequired
        });
        mutations.UpdateParameterValues(state, { p1: 10, p3: 30 });
        expect(state.parameterValues).toStrictEqual({ p1: 10, p2: 2, p3: 30 });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: true,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("updates advanced settings and sets runRequired to true", () => {
        const state = mockRunState({
            advancedSettings: {
                [AdvancedOptions.tol]: { val: [null, null], defaults: [1, -6], standardForm: true },
                [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, standardForm: false },
                [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, standardForm: false },
                [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], standardForm: true },
                [AdvancedOptions.tcrit]: { val: null, defaults: Infinity, standardForm: false }
            },
            runRequired: noRunRequired
        });
        mutations.UpdateAdvancedSettings(state, { option: AdvancedOptions.tol, newVal: [1, 2] });
        expect(state.advancedSettings).toStrictEqual({
            [AdvancedOptions.tol]: { val: [1, 2], defaults: [1, -6], standardForm: true },
            [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, standardForm: false },
            [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, standardForm: false },
            [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], standardForm: true },
            [AdvancedOptions.tcrit]: { val: null, defaults: Infinity, standardForm: false }
        });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: true
        });
    });

    it("sets end time and sets runRequired to Run", () => {
        const state = mockRunState({
            endTime: 99,
            runRequired: noRunRequired
        });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: true,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("sets end time does not require run if it shrinks", () => {
        const state = mockRunState({
            endTime: 100,
            runRequired: noRunRequired,
            resultOde: {
                inputs: {
                    endTime: 100
                }
            } as any
        });
        // shrinking is fine
        mutations.SetEndTime(state, 50);
        expect(state.endTime).toBe(50);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
        // increasing, even right up to the original limit, is fine
        mutations.SetEndTime(state, 100);
        expect(state.endTime).toBe(100);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
        // but any additional time requires a rerun
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: true,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });
    });

    it("sets userDownloadFileName", () => {
        const state = mockRunState();
        mutations.SetUserDownloadFileName(state, "myFile.xlsx");
        expect(state.userDownloadFileName).toBe("myFile.xlsx");
    });

    it("sets downloading", () => {
        const state = mockRunState();
        mutations.SetDownloading(state, true);
        expect(state.downloading).toBe(true);
    });

    it("sets number of replicates", () => {
        const state = mockRunState();
        mutations.SetNumberOfReplicates(state, 12);
        expect(state.numberOfReplicates).toBe(12);
        expect(state.runRequired.numberOfReplicatesChanged).toBe(true);
    });

    it("sets parameter set result", () => {
        const state = mockRunState();
        const payload = { name: "Set 1", result: { solution: "fake solution" } };
        mutations.SetParameterSetResult(state, payload);
        expect(state.parameterSetResults).toStrictEqual({ "Set 1": payload.result });
    });

    it("adds parameter set", () => {
        const state = mockRunState({ parameterSetsCreated: 2 });
        const payload = { name: "Set 3", parameterValues: { p1: 1 } };
        mutations.AddParameterSet(state, payload);
        expect(state.parameterSets).toStrictEqual([payload]);
        expect(state.parameterSetsCreated).toBe(3);
    });

    it("deletes parameter set", () => {
        const state = mockRunState({
            parameterSets: [
                { name: "Set1", parameterValues: { a: 1 }, hidden: false },
                { name: "Set2", parameterValues: { a: 2 }, hidden: false }
            ],
            parameterSetResults: { Set1: { value: "test 1" }, Set2: { value: "test 2" } } as any
        });
        mutations.DeleteParameterSet(state, "Set1");
        expect(state.parameterSets).toStrictEqual([{ name: "Set2", parameterValues: { a: 2 }, hidden: false }]);
        expect(state.parameterSetResults).toStrictEqual({ Set2: { value: "test 2" } });
    });

    it("swaps parameter sets with current parameter values", () => {
        const state = mockRunState({
            parameterValues: { a: 1 },
            parameterSets: [
                { name: "Set1", parameterValues: { a: 2 }, hidden: false }
            ],
            parameterSetResults: { Set1: { solution: "another fake result" } } as any,
            resultOde: { solution: "fake result" } as any
        });
        mutations.SwapParameterSet(state, "Set1");
        expect(state.parameterValues).toStrictEqual({ a: 2 });
        expect(state.parameterSets).toStrictEqual([{ name: "Set1", parameterValues: { a: 1 }, hidden: false }]);
        expect(state.parameterSetResults).toStrictEqual({ Set1: { solution: "fake result" } });
        expect(state.resultOde).toStrictEqual({ solution: "another fake result" });
    });

    it("does not swap parameter sets if paramSet does not exist", () => {
        const state = mockRunState({
            parameterValues: { a: 1 },
            parameterSets: [
                { name: "Set1", parameterValues: { a: 2 }, hidden: false }
            ],
            parameterSetResults: { Set1: { solution: "another fake result" } } as any,
            resultOde: { solution: "fake result" } as any
        });
        mutations.SwapParameterSet(state, "Set2");
        expect(state.parameterValues).toStrictEqual({ a: 1 });
        expect(state.parameterSets).toStrictEqual([{ name: "Set1", parameterValues: { a: 2 }, hidden: false }]);
        expect(state.parameterSetResults).toStrictEqual({ Set1: { solution: "another fake result" } });
        expect(state.resultOde).toStrictEqual({ solution: "fake result" });
    });

    it("does not swap parameter sets if parameterValues do not exist", () => {
        const state = mockRunState({
            parameterValues: null,
            parameterSets: [
                { name: "Set1", parameterValues: { a: 2 }, hidden: false }
            ],
            parameterSetResults: { Set1: { solution: "another fake result" } } as any,
            resultOde: { solution: "fake result" } as any
        });
        mutations.SwapParameterSet(state, "Set2");
        expect(state.parameterValues).toStrictEqual(null);
        expect(state.parameterSets).toStrictEqual([{ name: "Set1", parameterValues: { a: 2 }, hidden: false }]);
        expect(state.parameterSetResults).toStrictEqual({ Set1: { solution: "another fake result" } });
        expect(state.resultOde).toStrictEqual({ solution: "fake result" });
    });

    it("does not swap parameter sets if resultOde does not exist", () => {
        const state = mockRunState({
            parameterValues: { a: 1 },
            parameterSets: [
                { name: "Set1", parameterValues: { a: 2 }, hidden: false }
            ],
            parameterSetResults: { Set1: { solution: "another fake result" } } as any,
            resultOde: null
        });
        mutations.SwapParameterSet(state, "Set2");
        expect(state.parameterValues).toStrictEqual({ a: 1 });
        expect(state.parameterSets).toStrictEqual([{ name: "Set1", parameterValues: { a: 2 }, hidden: false }]);
        expect(state.parameterSetResults).toStrictEqual({ Set1: { solution: "another fake result" } });
        expect(state.resultOde).toStrictEqual(null);
    });

    it("toggles parameter set hidden", () => {
        const state = mockRunState({
            parameterSets: [
                { name: "Set1", parameterValues: { a: 1 }, hidden: false },
                { name: "Set2", parameterValues: { a: 2 }, hidden: false }
            ]
        });
        mutations.ToggleParameterSetHidden(state, "Set2");
        expect(state.parameterSets).toStrictEqual([
            { name: "Set1", parameterValues: { a: 1 }, hidden: false },
            { name: "Set2", parameterValues: { a: 2 }, hidden: true }
        ]);
        mutations.ToggleParameterSetHidden(state, "Set2");
        expect(state.parameterSets).toStrictEqual([
            { name: "Set1", parameterValues: { a: 1 }, hidden: false },
            { name: "Set2", parameterValues: { a: 2 }, hidden: false }
        ]);
    });
});
