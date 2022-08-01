import { mockModelFitState } from "../../../mocks";
import { getters, ModelFitGetter } from "../../../../src/app/store/modelFit/getters";

describe("ModelFit getters", () => {
    const model = {
        odin: {},
        odinRunner: {}
    };

    const fitData = {
        data: [{ t: 1, v: 2 }],
        timeVariable: "t",
        columnToFit: "v"
    };

    const state = mockModelFitState({ paramsToVary: ["p1"] });

    it("canRunFit is true when all prerequisites are met", () => {
        const rootState = { model, fitData };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(true);
    });

    it("canRunFit is false when odin is not set", () => {
        const rootState = {
            model: { ...model, odin: null },
            fitData
        };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(false);
    });

    it("canRunFit is false when odinRunner is not set", () => {
        const rootState = {
            model: { ...model, odinRunner: null },
            fitData
        };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(false);
    });

    it("canRunFit is false when data is not set", () => {
        const rootState = {
            model,
            fitData: { ...fitData, data: null }
        };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(false);
    });

    it("canRunFit is false when timeVariable is not set", () => {
        const rootState = {
            model,
            fitData: { ...fitData, timeVariable: null }
        };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(false);
    });

    it("canRunFit is false when columnToFit is not set", () => {
        const rootState = {
            model,
            fitData: { ...fitData, columnToFit: null }
        };
        expect((getters[ModelFitGetter.canRunFit] as any)(state, {}, rootState)).toBe(false);
    });

    it("canRunFit is false when paramsToVary is empty", () => {
        const rootState = { model, fitData };
        expect((getters[ModelFitGetter.canRunFit] as any)(mockModelFitState(), {}, rootState)).toBe(false);
    });
});
