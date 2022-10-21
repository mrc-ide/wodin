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
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";

jest.mock("plotly.js-basic-dist-min", () => {});

describe("SensitivityTab", () => {
    const mockRunSensitivity = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = {},
        sensitivityState: Partial<SensitivityState> = {}, batchPars: any = {}) => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    odinRunnerOde: {},
                    odin: {},
                    ...modelState
                }
            } as any,
            modules: {
                sensitivity: {
                    namespaced: true,
                    state: {
                        sensitivityUpdateRequired: {
                            modelChanged: false,
                            parameterValueChanged: false,
                            endTimeChanged: false,
                            sensitivityOptionsChanged: false
                        },
                        result: {
                            inputs: {},
                            batch: {
                                solutions: []
                            },
                            error: null
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

    it("renders as expected when Trace over Time", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("button").text()).toBe("Run sensitivity");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);

        expect(wrapper.findComponent(SensitivitySummaryPlot).exists()).toBe(false);
    });

    it("renders as expected when Value at Time", () => {
        const wrapper = getWrapper({}, { plotSettings: { plotType: SensitivityPlotType.ValueAtTime } as any });
        expect(wrapper.find("button").text()).toBe("Run sensitivity");
        expect(wrapper.find("button").element.disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);

        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders as expected when Time at Extreme", () => {
        const wrapper = getWrapper({}, { plotSettings: { plotType: SensitivityPlotType.TimeAtExtreme } as any });
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders as expected when Value at Extreme", () => {
        const wrapper = getWrapper({}, { plotSettings: { plotType: SensitivityPlotType.ValueAtExtreme } as any });
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(false);
        expect(wrapper.findComponent(SensitivityTracesPlot).exists()).toBe(false);
    });

    it("renders error", () => {
        const testError = { error: "Test Error", detail: "test error detail" };
        const sensitivityState = {
            result: {
                inputs: {} as any,
                batch: null,
                error: testError
            }
        };
        const wrapper = getWrapper({}, sensitivityState);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(testError);
    });

    it("disables run button when no odinRunnerOde", () => {
        const wrapper = getWrapper({ odinRunnerOde: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no odin model", () => {
        const wrapper = getWrapper({ odin: null });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when required action is Compile", () => {
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("disables run button when no batchPars", () => {
        const wrapper = getWrapper({}, {}, null);
        expect(wrapper.find("button").element.disabled).toBe(true);
    });

    it("renders expected update message when required action is Compile", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}] }
            }
        } as any;
        const wrapper = getWrapper({ compileRequired: true }, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Model code has been updated. Compile code and Run Sensitivity to update.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("renders expected update message when sensitivity requires update", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}] }
            },
            sensitivityUpdateRequired: {
                modelChanged: true,
                endTimeChanged: false
            }
        } as any;
        const wrapper = getWrapper({}, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Plot is out of date: model code has been recompiled. Run sensitivity to update.");
        expect(wrapper.findComponent(SensitivityTracesPlot).props("fadePlot")).toBe(true);
    });

    it("fades Summary plot when updated required", () => {
        const sensitivityState = {
            result: {
                batch: { solutions: [{}] }
            },
            plotSettings: { plotType: SensitivityPlotType.ValueAtTime } as any,
            sensitivityUpdateRequired: {
                modelChanged: false,
                parameterValueChanged: true,
                endTimeChanged: false
            }
        } as any;
        const wrapper = getWrapper({}, sensitivityState);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message"))
            .toBe("Plot is out of date: parameters have been changed. Run sensitivity to update.");
        expect(wrapper.findComponent(SensitivitySummaryPlot).props("fadePlot")).toBe(true);
    });

    it("dispatches sensitivity run when button is clicked", () => {
        const wrapper = getWrapper();
        expect(mockRunSensitivity).not.toHaveBeenCalled();
        wrapper.find("button").trigger("click");
        expect(mockRunSensitivity).toHaveBeenCalledTimes(1);
    });
});
