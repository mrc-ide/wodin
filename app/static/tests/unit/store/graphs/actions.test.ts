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
            { graphIndex: 1, selectedVariables: ["a", "b"] }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetSelectedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            graphIndex: 1,
            selectedVariables: ["b", "a"], // should have reordered variables to match model
            unselectedVariables: ["c"]
        });
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("Updates selected variables commits selection and updates linked variables if fit app", () => {
        const state = mockModelState();
        const commit = vi.fn();
        const dispatch = vi.fn();
        const fitRootState = mockFitState({
            model: modelState
        });

        (actions[GraphsAction.UpdateSelectedVariables] as any)(
            {
                commit,
                dispatch,
                state,
                rootState: fitRootState
            },
            { graphIndex: 1, selectedVariables: ["a", "b"] }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetSelectedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            graphIndex: 1,
            selectedVariables: ["b", "a"],
            unselectedVariables: ["c"]
        });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`fitData/${FitDataAction.UpdateLinkedVariables}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
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
