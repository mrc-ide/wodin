import { mockGraphsState } from "../../../mocks";
import { getters, GraphsGetter } from "../../../../src/store/graphs/getters";
import { defaultGraphConfig } from "@/store/graphs/state";

describe("GraphsGetters", () => {
    it("gets allSelectedVariables", () => {
        const state = mockGraphsState({
            graphs: [
                {
                    id: "123",
                    config: {
                        ...defaultGraphConfig(),
                        selectedVariables: ["a", "b"]
                    },
                    data: { lines: [], points: [] }
                },
                {
                    id: "456",
                    config: {
                        ...defaultGraphConfig(),
                        selectedVariables: ["d"]
                    },
                    data: { lines: [], points: [] }
                }
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
});
