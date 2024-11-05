import {
    BaseSensitivityMutation,
    mutations,
    SensitivityMutation
} from "../../../../src/store/sensitivity/mutations";
import { SensitivityPlotExtreme, SensitivityPlotType } from "../../../../src/store/sensitivity/state";
import { mockSensitivityState } from "../../../mocks";

describe("Sensitivity mutations", () => {
    const noUpdateRequired = {
        endTimeChanged: false,
        modelChanged: false,
        parameterValueChanged: false,
        sensitivityOptionsChanged: false
    };

    it("sets parameter to vary", () => {
        const state = {
            paramSettings: {
                parameterToVary: "A"
            }
        } as any;
        mutations[SensitivityMutation.SetParameterToVary](state, "B");
        expect(state.paramSettings.parameterToVary).toBe("B");
    });

    it("sets param settings", () => {
        const state = {
            paramSettings: {},
            sensitivityUpdateRequired: noUpdateRequired
        } as any;
        const newSettings = { parameterToVary: "A" };
        mutations[SensitivityMutation.SetParamSettings](state, newSettings);
        expect(state.paramSettings).toBe(newSettings);
        expect(state.sensitivityUpdateRequired).toStrictEqual({
            ...state.sensitivityUpdateRequired,
            sensitivityOptionsChanged: true
        });
    });

    it("sets batch", () => {
        const state = {
            result: {
                inputs: null,
                batch: null,
                error: { error: "TEST ERROR", detail: "test detail" }
            }
        } as any;
        const batch = {
            inputs: {},
            batch: { solutions: [] },
            error: null
        };
        mutations[BaseSensitivityMutation.SetResult](state, batch);
        expect(state.result).toBe(batch);
    });

    it("sets update required", () => {
        const state = {
            sensitivityUpdateRequired: {
                modelChanged: false,
                parameterValueChanged: false
            }
        } as any;
        mutations[BaseSensitivityMutation.SetUpdateRequired](state, { modelChanged: true });
        expect(state.sensitivityUpdateRequired).toStrictEqual({
            modelChanged: true,
            parameterValueChanged: false
        });
    });

    const plotSettings = {
        plotType: SensitivityPlotType.TraceOverTime,
        extreme: SensitivityPlotExtreme.Max,
        time: null
    };

    it("sets plot type", () => {
        const state = { plotSettings } as any;
        mutations[SensitivityMutation.SetPlotType](state, SensitivityPlotType.ValueAtTime);
        expect(state.plotSettings.plotType).toBe(SensitivityPlotType.ValueAtTime);
    });

    it("sets plot extreme", () => {
        const state = { plotSettings } as any;
        mutations[SensitivityMutation.SetPlotExtreme](state, SensitivityPlotExtreme.Min);
        expect(state.plotSettings.extreme).toBe(SensitivityPlotExtreme.Min);
    });

    it("sets plot time", () => {
        const state = { plotSettings } as any;
        mutations[SensitivityMutation.SetPlotTime](state, 50);
        expect(state.plotSettings.time).toBe(50);
    });

    it("sets error", () => {
        const state = {} as any;
        const batch = {
            inputs: {},
            batch: null,
            error: { error: "TEST ERROR", detail: "test error detail" }
        };
        mutations[BaseSensitivityMutation.SetResult](state, batch);
        expect(state.result).toBe(batch);
    });

    it("sets end time and updates update required", () => {
        const state = {
            result: {
                inputs: null,
                batch: null
            },
            sensitivityUpdateRequired: noUpdateRequired
        } as any;
        mutations.SetEndTime(state, 100);
        expect(state.sensitivityUpdateRequired).toStrictEqual({
            ...state.sensitivityUpdateRequired,
            endTimeChanged: true
        });
    });

    it("sets end time does not require run if it shrinks", () => {
        const state = {
            result: {
                inputs: { endTime: 100 },
                batch: null
            },
            sensitivityUpdateRequired: noUpdateRequired
        } as any;

        // shrinking is fine
        mutations.SetEndTime(state, 50);
        expect(state.sensitivityUpdateRequired.endTimeChanged).toBe(false);

        // increasing, even right up to the original limit, is fine
        mutations.SetEndTime(state, 100);
        expect(state.sensitivityUpdateRequired.endTimeChanged).toBe(false);

        // but any additional time requires a rerun
        mutations.SetEndTime(state, 101);
        expect(state.sensitivityUpdateRequired.endTimeChanged).toBe(true);
    });

    it("sets running", () => {
        const state = mockSensitivityState();
        mutations.SetRunning(state, true);
        expect(state.running).toBe(true);
    });

    it("sets running", () => {
        const state = mockSensitivityState();
        mutations.SetLoading(state, true);
        expect(state.loading).toBe(true);
    });

    it("saves result when parameter set added", () => {
        const mockResult = { batch: "fake batch" } as any;
        const state = mockSensitivityState({
            result: mockResult
        });
        mutations.ParameterSetAdded(state, "Set 1");
        expect(state.parameterSetResults).toStrictEqual({ "Set 1": mockResult });
    });

    it("does nothing when parameter set added if no current result", () => {
        const state = mockSensitivityState();
        mutations.ParameterSetAdded(state, "Set 1");
        expect(state.parameterSetResults).toStrictEqual({});
    });

    it("sets parameter set results", () => {
        const state = mockSensitivityState();
        const results = {
            "Set 1": { batch: "fake batch 1" },
            "Set 2": { batch: "fake batch 2" }
        };
        mutations.SetParameterSetResults(state, results);
        expect(state.parameterSetResults).toBe(results);
    });

    it("deleted parameter set results", () => {
        const state = mockSensitivityState({
            parameterSetResults: { Set1: { batch: "test 1" }, Set2: { batch: "test 2" } } as any
        });
        mutations.ParameterSetDeleted(state, "Set1");
        expect(state.parameterSetResults).toStrictEqual({ Set2: { batch: "test 2" } });
    });

    it("swaps parameter set results", () => {
        const state = mockSensitivityState({
            result: { solution: "fake result" } as any,
            parameterSetResults: { Set1: { solution: "another fake result" } } as any
        });
        mutations.ParameterSetSwapped(state, "Set1");
        expect(state.parameterSetResults).toStrictEqual({ Set1: { solution: "fake result" } });
        expect(state.result).toStrictEqual({ solution: "another fake result" });
    });

    it("deletes set1 key in results if result of Ode was null", () => {
        const state = mockSensitivityState({
            result: null,
            parameterSetResults: { Set1: { solution: "another fake result" } } as any
        });
        mutations.ParameterSetSwapped(state, "Set1");
        expect(state.parameterSetResults).toStrictEqual({});
        expect(state.result).toStrictEqual({ solution: "another fake result" });
    });

    it("sets downloading", () => {
        const state = mockSensitivityState();
        mutations.SetDownloading(state, true);
        expect(state.downloading).toBe(true);
    });

    it("sets user summary download file name", () => {
        const state = mockSensitivityState();
        mutations.SetUserSummaryDownloadFileName(state, "newtest.xlsx");
        expect(state.userSummaryDownloadFileName).toBe("newtest.xlsx");
    });
});
