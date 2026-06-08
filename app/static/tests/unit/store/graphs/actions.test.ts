import { mockAxios } from "../../../mocks";
import { actions, GraphsAction } from "../../../../src/store/graphs/actions";
import { AppType } from "../../../../src/store/appState/state";
import { getState } from "./mutations.test";

vi.mock("@/plotData", () => {
    return { getPlotData: () => ({ lines: [], points: [] }) };
});

describe("Graphs actions", () => {
    const modelState = {
        odinModelResponse: {
            metadata: { variables: ["R", "S", "I"] }
        }
    } as any;

    const rootState = {
        appType: AppType.Basic,
        model: modelState
    };

    beforeEach(() => {
        mockAxios.reset();
    });

    it("generate data works as expected", () => {
        const state = getState();
        state.configs[0].selectedVariables = ["I", "R"];
        state.configs[1].selectedVariables = ["S", "R"];
        state.visibleGraphGroups = ["graph1"];

        (actions[GraphsAction.GenerateData] as any)({ rootState, state });

        // generated data
        expect(state.visibleData).toStrictEqual({
            graph1: [
                { configId: "123", data: { lines: [], points: [] } },
                { configId: "456", data: { lines: [], points: [] } },
            ]
        });

        // marked as non reactive
        expect((state.visibleData["graph1"][0].data as any)["__v_skip"]).toBe(true);
        expect((state.visibleData["graph1"][1].data as any)["__v_skip"]).toBe(true);

        // ordered selected variables
        expect(state.configs[0].selectedVariables).toStrictEqual(["R", "I"]);
        expect(state.configs[1].selectedVariables).toStrictEqual(["R", "S"]);
    });
});
