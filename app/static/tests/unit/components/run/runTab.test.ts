// Mock plotly before import RunTab, which indirectly imports plotly via RunPlot
jest.mock("plotly.js-basic-dist-min", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState, mockRunState } from "../../../mocks";
import { ModelState } from "../../../../src/app/store/model/state";
import { RunState } from "../../../../src/app/store/run/state";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import ActionRequiredMessage from "../../../../src/app/components/ActionRequiredMessage.vue";
import DownloadOutput from "../../../../src/app/components/DownloadOutput.vue";

describe("RunTab", () => {
    const defaultModelState = {
        odinRunner: {} as any,
        odin: {} as any,
        compileRequired: false
    };

    const defaultRunState = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRunModel = jest.fn();

    const getWrapper = (modelState: Partial<ModelState> = defaultModelState,
        runState: Partial<RunState> = defaultRunState) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(modelState),
                    actions: {
                    }
                },
                run: {
                    namespaced: true,
                    state: mockRunState(runState),
                    actions: {
                        RunModel: mockRunModel
                    }
                }
            }
        });
        return shallowMount(RunTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected when can run model", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("button#run-btn").text()).toBe("Run model");
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(false);

        // Download button disabled because there is no model solution
        expect(wrapper.find("button#download-btn").text()).toBe("Download");
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(DownloadOutput).props().open).toBe(false);
    });

    it("disables run button when state has no odinRunner", () => {
        const wrapper = getWrapper({ odinRunner: null });
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run button when state has no odin model", () => {
        const wrapper = getWrapper({ odin: null });
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("disables run and download buttons when compile is required", () => {
        const modelState = { compileRequired: true };
        const runState = { result: { solution: {} } as any };
        const wrapper = getWrapper(modelState, runState);
        expect((wrapper.find("button#run-btn").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("enables download button when model has a solution", () => {
        const wrapper = getWrapper({}, { result: { solution: {} } as any });
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables download button when run is required ", () => {
        const runState = {
            result: { solution: {} } as any,
            runRequired: { modelChanged: true } as any
        };
        const wrapper = getWrapper({}, runState);
        expect((wrapper.find("button#download-btn").element as HTMLButtonElement).disabled).toBe(true);
    });

    it("fades plot and shows message when compile required", () => {
        const wrapper = getWrapper({
            compileRequired: true
        });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Model to update."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("fades plot and shows message when model run required", () => {
        const runRequired = {
            modelChanged: true,
            parameterValueChanged: false,
            endTimeChanged: false
        };
        const wrapper = getWrapper({ compileRequired: false }, { runRequired });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Plot is out of date: model code has been recompiled. Run model to update."
        );
        expect(wrapper.findComponent(RunPlot).props("fadePlot")).toBe(true);
    });

    it("invokes run model action when run button is clicked", () => {
        const wrapper = getWrapper();
        wrapper.find("button#run-btn").trigger("click");
        expect(mockRunModel).toHaveBeenCalled();
    });

    it("displays error info in run model", () => {
        const odinRunnerError = { error: "model error", detail: "with details" };
        const result = {
            inputs: { endTime: 99, parameterValues: {} },
            error: odinRunnerError,
            solution: null
        };
        const wrapper = getWrapper({}, { result });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(odinRunnerError);
    });

    it("opens download dialog on click download button, and closes when dialog emits close event", async () => {
        const wrapper = getWrapper({}, { result: { solution: {} } as any });
        await wrapper.find("button#download-btn").trigger("click");
        const download = wrapper.findComponent(DownloadOutput);
        expect(download.props().open).toBe(true);
        await download.vm.$emit("close");
        expect(download.props().open).toBe(false);
    });
});
