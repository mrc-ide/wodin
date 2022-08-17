// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import { ModelState } from "../../../../src/app/store/model/state";
/* eslint-disable import/first */
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { SensitivityPlotType, SensitivityState } from "../../../../src/app/store/sensitivity/state";
import { SensitivityAction } from "../../../../src/app/store/sensitivity/actions";

jest.mock("plotly.js", () => {});

describe("SensitivityTab", () => {
    const mockRunSensitivity = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = {},
        sensitivityState: Partial<SensitivityState> = {}, batchPars: any = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    odinRunner: {},
                    odin: {},
                    ...modelState
                }
            } as any,
            modules: {
                sensitivity: {
                    namespaced: true,
                    state: {
                        sensitivityUpdateRequired: false,
                        batch: {
                            solutions: []
                        },
                        plotSettings: {
                            plotType: SensitivityPlotType.TraceOverTime
                        },
                        ...sensitivityState
                    },
                    getters: {
                        [SensitivityGetter.batchPars]: () => batchPars
                    },
                    actions: {
                        [SensitivityAction.RunSensitivity]: mockRunSensitivity
                    }
                }
            }
        });
        return shallowMount(SensitivityTab, {
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("button").text()).toBe("Run sensitivity");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(false);

        expect(wrapper.find("#sensitivity-plot-placeholder").exists()).toBe(false);
    });

    it("renders placeholder if plot type is not Trace over time", () => {
        const sensitivityState = {
            plotSettings: {
                plotType: SensitivityPlotType.ValueAtTime
            }
        } as any;
        const wrapper = getWrapper({}, sensitivityState);
        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
        expect(wrapper.find("#sensitivity-plot-placeholder").text()).toBe("Other plot types coming soon!");
    });

    it("disables run button when no odinRunner", () => {
        const wrapper = getWrapper({ odinRunner: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no odin model", () => {
        const wrapper = getWrapper({ odin: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when required action is Compile", () => {
        const wrapper = getWrapper({
            compileRequired: true,
            runRequired: false
        });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no batchPars", () => {
        const wrapper = getWrapper({}, {}, null);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("renders expected update message when required action is Compile", () => {
        const sensitivityState = {
            batch: { solutions: [{}] }
        } as any;
        const wrapper = getWrapper({ compileRequired: true, runRequired: false }, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been updated. Compile code and Run Sensitivity to view updated graph.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when sensitivity requires update", () => {
        const sensitivityState = {
            batch: { solutions: [{}] },
            sensitivityUpdateRequired: true
        } as any;
        const wrapper = getWrapper({}, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been recompiled or options have been updated. "
                + "Run Sensitivity to view updated graph.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("dispatches sensitivity run when button is clicked", () => {
        const wrapper = getWrapper();
        expect(mockRunSensitivity).not.toHaveBeenCalled();
        wrapper.find("button").trigger("click");
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
    });
});
