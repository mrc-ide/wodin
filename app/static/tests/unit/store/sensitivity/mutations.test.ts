import { mutations, SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { SensitivityPlotExtreme, SensitivityPlotType } from "../../../../src/app/store/sensitivity/state";

describe("Sensitivity mutations", () => {
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
            sensitivityUpdateRequired: false
        } as any;
        const newSettings = { parameterToVary: "A" };
        mutations[SensitivityMutation.SetParamSettings](state, newSettings);
        expect(state.paramSettings).toBe(newSettings);
        expect(state.sensitivityUpdateRequired).toBe(true);
    });

    it("sets batch", () => {
        const state = {
            result: {
                inputs: null,
                result: null,
                error: { error: "TEST ERROR", detail: "test detail" }
            }
        } as any;
        const batch = {
            inputs: {},
            result: { solutions: [] },
            error: null
        };
        mutations[SensitivityMutation.SetResult](state, batch);
        expect(state.result).toBe(batch);
    });

    it("sets update required", () => {
        const state = {
            sensitivityUpdateRequired: false
        } as any;
        mutations[SensitivityMutation.SetUpdateRequired](state, true);
        expect(state.sensitivityUpdateRequired).toBe(true);
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
        const state = { } as any;
        const batch = {
            inputs: {},
            result: null,
            error: { error: "TEST ERROR", detail: "test error detail" }
        };
        mutations[SensitivityMutation.SetResult](state, batch);
        expect(state.result).toBe(batch);
    });
});
