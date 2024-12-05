import { mockMultiSensitivityState } from "../../../mocks";
import { mutations, MultiSensitivityMutation } from "../../../../src/store/multiSensitivity/mutations";

describe("MultiSensitivity mutations", () => {
    it("Sets parameter settings", () => {
        const state = mockMultiSensitivityState();
        const paramSettings = [{ parameterToVary: "X" }, { parameterToVary: "Y" }] as any;
        mutations[MultiSensitivityMutation.SetParamSettings](state, paramSettings);
        expect(state.paramSettings).toBe(paramSettings);
    });
});
