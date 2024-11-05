import { ModelGetter, getters } from "../../../../src/store/model/getters";
import { mockBasicState, mockModelState, mockStochasticState } from "../../../mocks";

describe("ModelGetters", () => {
    it("returns false if no discrete runner when app is stochastic", () => {
        const state = mockModelState();
        const rootState = mockStochasticState();
        expect((getters[ModelGetter.hasRunner] as any)(state, {}, rootState)).toBe(false);
    });

    it("returns true if discrete runner is set when app is stochastic", () => {
        const state = mockModelState({ odinRunnerDiscrete: {} as any });
        const rootState = mockStochasticState();
        expect((getters[ModelGetter.hasRunner] as any)(state, {}, rootState)).toBe(true);
    });

    it("returns false if no ode runner when app is not stochastic", () => {
        const state = mockModelState();
        const rootState = mockBasicState();
        expect((getters[ModelGetter.hasRunner] as any)(state, {}, rootState)).toBe(false);
    });

    it("returns true if ode runner is set when app is not stochastic", () => {
        const state = mockModelState({ odinRunnerOde: {} as any });
        const rootState = mockBasicState();
        expect((getters[ModelGetter.hasRunner] as any)(state, {}, rootState)).toBe(true);
    });
});
