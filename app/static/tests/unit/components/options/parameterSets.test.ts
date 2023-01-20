import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { RunState } from "../../../../src/app/store/run/state";
import { mockBasicState, mockModelState, mockRunState } from "../../../mocks";
import ParameterSets from "../../../../src/app/components/options/ParameterSets.vue";
import ParameterSetView from "../../../../src/app/components/options/ParameterSetView.vue";
import { ModelState } from "../../../../src/app/store/model/state";
import { getters } from "../../../../src/app/store/run/getters";
import { RunAction } from "../../../../src/app/store/run/actions";

describe("ParameterSets", () => {
    const mockNewParameterSet = jest.fn();
    const getWrapper = (runState: Partial<RunState>, modelState: Partial<ModelState> = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                model: mockModelState(modelState)
            }),
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState(runState),
                    getters,
                    actions: {
                        [RunAction.NewParameterSet]: mockNewParameterSet
                    }
                }
            }
        });
        return shallowMount(ParameterSets, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("renders as expected", () => {
        const runState = {
            parameterSets: [
                { name: "Set 1", parameterValues: { alpha: 1, beta: 2, gamma: 3 }, hidden: false },
                { name: "Set 2", parameterValues: { alpha: 10, beta: 20, gamma: 30 }, hidden: false }
            ],
            parameterValues: { alpha: 2, beta: 3, gamma: 4 }
        };
        const wrapper = getWrapper(runState);
        expect(wrapper.find("button").text()).toBe("Save Current Parameters");
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(false);
        const paramSetViews = wrapper.findAllComponents(ParameterSetView);
        expect(paramSetViews.length).toBe(2);
        expect(paramSetViews.at(0)!.props("parameterSet")).toStrictEqual(runState.parameterSets[0]);
        expect(paramSetViews.at(0)!.props("index")).toBe(0);
        expect(paramSetViews.at(1)!.props("parameterSet")).toStrictEqual(runState.parameterSets[1]);
        expect(paramSetViews.at(1)!.props("index")).toBe(1);
    });

    it("cannot save new parameter set if compile is required", () => {
        const runState = {
            parameterValues: { alpha: 2, beta: 3, gamma: 4 }
        };
        const modelState = { compileRequired: true };
        const wrapper = getWrapper(runState, modelState);
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("cannot save new parameter set if run is required", () => {
        const runState = {
            parameterValues: { alpha: 2, beta: 3, gamma: 4 },
            runRequired: {
                modelChanged: true,
                parameterValueChanged: false,
                endTimeChanged: false,
                numberOfReplicatesChanged: false
            }
        };
        const wrapper = getWrapper(runState);
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("cannot save new parameter set if duplicate exists", () => {
        const runState = {
            parameterValues: { alpha: 2, beta: 3, gamma: 4 },
            parameterSets: [
                { name: "Set 1", parameterValues: { alpha: 1, beta: 2, gamma: 3 }, hidden: false },
                { name: "Set 2", parameterValues: { alpha: 2, beta: 3, gamma: 4 }, hidden: false }
            ]
        };
        const wrapper = getWrapper(runState);
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("saves new parameter set when click button", async () => {
        const wrapper = getWrapper({});
        await wrapper.find("button#create-param-set").trigger("click");
        expect(mockNewParameterSet).toHaveBeenCalledTimes(1);
    });
});
