import { mutations } from "../../../../src/app/store/run/mutations";
import { mockRunState } from "../../../mocks";

describe("Run mutations", () => {
    const noRunRequired = {
        endTimeChanged: false,
        modelChanged: false,
        parameterValueChanged: false,
        numberOfReplicatesChanged: false
    };

    it("sets result ode", () => {
        const mockSolution = () => [{ x: 1, y: 2 }];
        const state = mockRunState({
            runRequired: {
                endTimeChanged: false,
                modelChanged: true,
                parameterValueChanged: true,
                numberOfReplicatesChanged: false
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
            numberOfReplicatesChanged: false
        });
    });

    it("sets result discrete", () => {
        const mockSeriesSet = { values: [] } as any;
        const state = mockRunState({
            runRequired: {
                endTimeChanged: false,
                modelChanged: true,
                parameterValueChanged: true,
                numberOfReplicatesChanged: false
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
            numberOfReplicatesChanged: false
        });
    });

    it("sets run required", () => {
        const state = mockRunState();
        mutations.SetRunRequired(state, { modelChanged: true });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: true,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false
        });
        mutations.SetRunRequired(state, { modelChanged: false });
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false
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
            numberOfReplicatesChanged: false
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
            numberOfReplicatesChanged: false
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
            numberOfReplicatesChanged: false
        });
        // increasing, even right up to the original limit, is fine
        mutations.SetEndTime(state, 100);
        expect(state.endTime).toBe(100);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false
        });
        // but any additional time requires a rerun
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.runRequired).toStrictEqual({
            endTimeChanged: true,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false
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
        const state = mockRunState();
        const payload = { name: "Set 1", parameterValues: { p1: 1 } };
        mutations.AddParameterSet(state, payload);
        expect(state.parameterSets).toStrictEqual([payload]);
    });
});
