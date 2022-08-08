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
            paramSettings: {}
        } as any;
        const newSettings = { parameterToVary: "A" };
        mutations[SensitivityMutation.SetParamSettings](state, newSettings);
        expect(state.paramSettings).toBe(newSettings);
    });
});
