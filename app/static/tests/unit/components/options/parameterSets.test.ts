import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/store/basic/state";
import { RunState } from "../../../../src/store/run/state";
import { mockBasicState, mockModelState, mockRunState } from "../../../mocks";
import ParameterSets from "../../../../src/components/options/ParameterSets.vue";
import ParameterSetView from "../../../../src/components/options/ParameterSetView.vue";
import { ModelState } from "../../../../src/store/model/state";
import { getters } from "../../../../src/store/run/getters";
import { RunAction } from "../../../../src/store/run/actions";
import { RunMutation } from "../../../../src/store/run/mutations";

describe("ParameterSets", () => {
    const mockNewParameterSet = vi.fn();
    const mockToggleShowUnchangedParameters = vi.fn();
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
                    },
                    mutations: {
                        [RunMutation.ToggleShowUnchangedParameters]: mockToggleShowUnchangedParameters
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
        vi.resetAllMocks();
    });

    it("renders as expected", () => {
        const runState = {
            parameterSets: [
                {
                    name: "Set 1",
                    displayName: "Set 1",
                    displayNameErrorMsg: "",
                    parameterValues: { alpha: 1, beta: 2, gamma: 3 },
                    hidden: false
                },
                {
                    name: "Set 2",
                    displayName: "Set 2",
                    displayNameErrorMsg: "",
                    parameterValues: { alpha: 10, beta: 20, gamma: 30 },
                    hidden: false
                }
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
                numberOfReplicatesChanged: false,
                advancedSettingsChanged: false
            }
        };
        const wrapper = getWrapper(runState);
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("cannot save new parameter set if duplicate exists", () => {
        const runState = {
            parameterValues: { alpha: 2, beta: 3, gamma: 4 },
            parameterSets: [
                {
                    name: "Set 1",
                    displayName: "Set 1",
                    displayNameErrorMsg: "",
                    parameterValues: { alpha: 1, beta: 2, gamma: 3 },
                    hidden: false
                },
                {
                    name: "Set 2",
                    displayName: "Set 2",
                    displayNameErrorMsg: "",
                    parameterValues: { alpha: 2, beta: 3, gamma: 4 },
                    hidden: false
                }
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

    it("should show text when no parameter sets saved", () => {
        const wrapper = getWrapper({});
        expect(wrapper.find("p.small").text()).toBe("Saved parameter sets will show here");
    });
    it("should call ToggleShowUnchangedParameters when unchanged parameters checkbox is clicked", async () => {
        const wrapper = getWrapper({});
        await wrapper.find("input.form-check-input").trigger("input");
        expect(mockToggleShowUnchangedParameters).toHaveBeenCalledTimes(1);
    });
});
