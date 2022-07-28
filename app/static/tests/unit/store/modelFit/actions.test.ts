import resetAllMocks = jest.resetAllMocks;
import { ModelFitMutation } from "../../../../src/app/store/modelFit/mutations";
import { mockFitDataState, mockModelFitState, mockModelState } from "../../../mocks";
import { actions, ModelFitAction } from "../../../../src/app/store/modelFit/actions";
import { ModelMutation } from "../../../../src/app/store/model/mutations";

describe("ModelFit actions", () => {
    const mockSimplex = {} as any;
    const mockWodinFit = jest.fn().mockReturnValue(mockSimplex);
    const mockOdinRunner = {
        wodinFit: mockWodinFit
    } as any;
    const mockOdin = {} as any;
    const parameterValues = new Map<string, number>();
    parameterValues.set("p1", 1.1);
    parameterValues.set("p2", 2.2);
    const modelState = mockModelState({
        odin: mockOdin,
        odinRunner: mockOdinRunner,
        parameterValues
    });

    const fitDataState = mockFitDataState({
        data: [
            { t: 0, v: 10, w: 11 },
            { t: 1, v: 20, w: 22 },
            { t: 2, v: 30, w: 33 }
        ],
        timeVariable: "t",
        columnToFit: "v",
        linkedVariables: { v: "S", w: "I" }
    });

    const rootState = {
        model: modelState,
        fitData: fitDataState
    } as any;

    const state = mockModelFitState();

    afterEach(() => {
        resetAllMocks();
    });

    it("FitModel calls wodinFit and dispatches FitModelStep action", () => {
        const getters = { canRunFit: true };
        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[ModelFitAction.FitModel] as any)({
            commit, dispatch, state, rootState, getters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetFitting);
        expect(commit.mock.calls[0][1]).toBe(true);
        expect(commit.mock.calls[1][0]).toBe(ModelFitMutation.SetFitUpdateRequired);
        expect(commit.mock.calls[1][1]).toBe(false);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(ModelFitAction.FitModelStep);
        expect(dispatch.mock.calls[0][1]).toBe(mockSimplex);

        expect(mockWodinFit).toHaveBeenCalledTimes(1);
        expect(mockWodinFit.mock.calls[0][0]).toBe(mockOdin);
        expect(mockWodinFit.mock.calls[0][1]).toStrictEqual({
            time: [0, 1, 2],
            value: [10, 20, 30]
        });
        expect(mockWodinFit.mock.calls[0][2]).toStrictEqual({
            base: parameterValues,
            vary: ["p1", "p2"]
        });
        expect(mockWodinFit.mock.calls[0][3]).toBe("S");
        expect(mockWodinFit.mock.calls[0][4]).toStrictEqual({});
        expect(mockWodinFit.mock.calls[0][5]).toStrictEqual({});
    });

    it("FitModel does nothing if cannot fit model", () => {
        const getters = { canRunFit: false };
        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[ModelFitAction.FitModel] as any)({
            commit, dispatch, state, rootState, getters
        });
        expect(commit).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
        expect(mockWodinFit).not.toHaveBeenCalled();
    });

    it("FitModelStep commits expected changes and dispatches further step if not converged", (done) => {
        const result = {
            converged: false,
            data: {
                pars: new Map<string, number>()
            }
        };
        const simplex = {
            step: jest.fn(),
            result: () => result
        } as any;

        const testState = mockModelFitState({ fitting: true });

        const commit = jest.fn();
        const dispatch = jest.fn();
        (actions[ModelFitAction.FitModelStep] as any)({ commit, dispatch, state: testState }, simplex);

        setTimeout(() => {
            expect(simplex.step).toHaveBeenCalledTimes(1);
            expect(commit).toHaveBeenCalledTimes(2);
            expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetResult);
            expect(commit.mock.calls[0][1]).toBe(result);
            expect(commit.mock.calls[1][0]).toBe(`model/${ModelMutation.SetParameterValues}`);
            expect(commit.mock.calls[1][1]).toBe(result.data.pars);
            expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });

            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch.mock.calls[0][0]).toBe(ModelFitAction.FitModelStep);
            expect(dispatch.mock.calls[0][1]).toBe(simplex);
            done();
        });
    });

    it("FitModelStep does not dispatch further step if converged", (done) => {
        const result = {
            converged: true,
            data: {
                pars: new Map<string, number>()
            }
        };
        const simplex = {
            step: jest.fn(),
            result: () => result
        } as any;

        const commit = jest.fn();
        const dispatch = jest.fn();
        const testState = mockModelFitState({ fitting: true });
        (actions[ModelFitAction.FitModelStep] as any)({ commit, dispatch, state: testState }, simplex);

        setTimeout(() => {
            expect(simplex.step).toHaveBeenCalledTimes(1);
            expect(commit).toHaveBeenCalledTimes(3);
            expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetResult);
            expect(commit.mock.calls[1][0]).toBe(`model/${ModelMutation.SetParameterValues}`);
            expect(commit.mock.calls[2][0]).toBe(ModelFitMutation.SetFitting);
            expect(commit.mock.calls[2][1]).toBe(false);

            expect(dispatch).not.toHaveBeenCalled();
            done();
        });
    });

    it("FitModelStep does nothing if not fitting", (done) => {
        const simplex = {
            step: jest.fn()
        };
        const commit = jest.fn();
        const dispatch = jest.fn();
        const testState = mockModelFitState({ fitting: false });
        (actions[ModelFitAction.FitModelStep] as any)({ commit, dispatch, state: testState }, simplex);
        setTimeout(() => {
            expect(simplex.step).not.toHaveBeenCalled();
            expect(commit).not.toHaveBeenCalled();
            expect(dispatch).not.toHaveBeenCalled();
            done();
        });
    });
});
