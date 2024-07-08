import { mockGraphsState } from "../../../mocks";
import { getters, GraphsGetter } from "../../../../src/app/store/graphs/getters";

describe("GraphsGetters", () => {
    it("gets allSelectedVariables", () => {
        const state = mockGraphsState({
            config: [
                { id: "123", selectedVariables: ["a", "b"], unselectedVariables: ["c", "d"] },
                { id: "456",selectedVariables: ["d"], unselectedVariables: ["a", "b", "c"] }
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
