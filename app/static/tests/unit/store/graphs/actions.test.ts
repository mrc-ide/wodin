import { mockAxios, mockFitState, mockModelState } from "../../../mocks";
import { actions, GraphsAction } from "../../../../src/app/store/graphs/actions";
import { GraphsMutation } from "../../../../src/app/store/graphs/mutations";
import { AppType } from "../../../../src/app/store/appState/state";
import { FitDataAction } from "../../../../src/app/store/fitData/actions";

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
        const commit = jest.fn();
        const dispatch = jest.fn();

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
        const commit = jest.fn();
        const dispatch = jest.fn();
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
        const commit = jest.fn();

        (actions[GraphsAction.NewGraph] as any)({
            commit,
            rootState
        });
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.AddGraph);
        expect(commit.mock.calls[0][1].selectedVariables).toStrictEqual([]);
        expect(commit.mock.calls[0][1].unselectedVariables).toStrictEqual(["b", "a", "c"]);
        expect(commit.mock.calls[0][1].id.length).toBe(32);
    });
});
