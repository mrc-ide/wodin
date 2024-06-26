import { mockAxios, mockFitState, mockModelState } from "../../../mocks";
import { actions, GraphsAction } from "../../../../src/app/store/graphs/actions";
import { GraphsMutation } from "../../../../src/app/store/graphs/mutations";
import { AppType } from "../../../../src/app/store/appState/state";
import { FitDataAction } from "../../../../src/app/store/fitData/actions";

describe("Graphs actions", () => {
    const modelState = {
        odinModelResponse: {
            metadata: {
                variables: ["a", "b", "c"]
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
            { index: 1, selectedVariables: ["a", "b"] }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetSelectedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            index: 1,
            selectedVariables: ["a", "b"],
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
            { index: 1, selectedVariables: ["a", "b"] }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetSelectedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            index: 1,
            selectedVariables: ["a", "b"],
            unselectedVariables: ["c"]
        });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`fitData/${FitDataAction.UpdateLinkedVariables}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
    });
});
