import { mockAxios, mockFitState, mockModelState } from "../../../mocks";
import { actions, GraphsAction } from "../../../../src/store/graphs/actions";
import { GraphsMutation } from "../../../../src/store/graphs/mutations";
import { AppType } from "../../../../src/store/appState/state";
import { FitDataAction } from "../../../../src/store/fitData/actions";
import { defaultGraphSettings } from "../../../../src/store/graphs/state";

describe("Graphs actions", () => {
    const modelState = {
        odinModelResponse: {
            metadata: {
                variables: ["b", "a", "c"]
            }
        }
    } as any;

    const rootState = {
        appType: AppType.Basic,
        model: modelState
    };

    beforeEach(() => {
        mockAxios.reset();
    });

    it("Updates selected variables commits selection only, if not fit model", () => {
        const state = mockModelState();
        const commit = vi.fn();
        const dispatch = vi.fn();

        (actions[GraphsAction.UpdateSelectedVariables] as any)(
            {
                commit,
                dispatch,
                state,
                rootState
            },
            { id: "123", selectedVariables: ["a", "b"] }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetGraphConfig);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            id: "123",
            selectedVariables: ["b", "a"], // should have reordered variables to match model
            unselectedVariables: ["c"]
        });
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("NewGraph adds empty graph", () => {
        const commit = vi.fn();

        (actions[GraphsAction.NewGraph] as any)({
            commit,
            rootState
        });
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.AddGraph);
        expect(commit.mock.calls[0][1].selectedVariables).toStrictEqual([]);
        expect(commit.mock.calls[0][1].unselectedVariables).toStrictEqual(["b", "a", "c"]);
        expect(commit.mock.calls[0][1].id.length).toBe(32);
        expect(commit.mock.calls[0][1].settings).toStrictEqual(defaultGraphSettings());
    });
});
