import { mutations, SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

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
            batch: null
        } as any;
        const batch = {solutions: []} as any
        mutations[SensitivityMutation.SetBatch](state, batch);
        expect(state.batch).toBe(batch);
    });

    it("sets update required", () => {
        const state = {
            sensitivityUpdateRequired: false
        } as any;
        mutations[SensitivityMutation.SetUpdateRequired](state, true);
        expect(state.sensitivityUpdateRequired).toBe(true);
    });
});
