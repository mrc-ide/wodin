import { mockGraphsState } from "../../../mocks";
import { getters, GraphsGetter } from "../../../../src/store/graphs/getters";
import { defaultGraphSettings } from "../../../../src/store/graphs/state";

describe("GraphsGetters", () => {
    const settings = defaultGraphSettings();

    it("gets allSelectedVariables", () => {
        const state = mockGraphsState({
            config: [
                { id: "123", selectedVariables: ["a", "b"], unselectedVariables: ["c", "d"], settings },
                { id: "456", selectedVariables: ["d"], unselectedVariables: ["a", "b", "c"], settings }
            ]
        });
        expect((getters[GraphsGetter.allSelectedVariables] as any)(state)).toStrictEqual(["a", "b", "d"]);
    });

    it("gets hiddenVariables", () => {
        const testGetters = {
            allSelectedVariables: ["a", "b", "d"]
        };
        const rootState = {
            model: {
                odinModelResponse: {
                    metadata: {
                        variables: ["e", "d", "c", "b", "a"]
                    }
                }
            }
        } as any;
        expect((getters[GraphsGetter.hiddenVariables] as any)({}, testGetters, rootState)).toStrictEqual(["e", "c"]);
    });

    it("gets legend width", () => {
        const testGetters = {
            allSelectedVariables: ["a", "zz", "a longer name"]
        };
        expect((getters[GraphsGetter.legendWidth] as any)({}, testGetters)).toBe(170);
    });
});
