import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import MultiSensitivityTab from "../../../../src/components/multiSensitivity/MultiSensitivityTab.vue";
import { AppState } from "../../../../src/store/appState/state";
import LoadingButton from "../../../../src/components/LoadingButton.vue";
import { ModelState } from "../../../../src/store/model/state";
import { MultiSensitivityAction } from "../../../../src/store/multiSensitivity/actions";
import ActionRequiredMessage from "../../../../src/components/ActionRequiredMessage.vue";
import { MultiSensitivityState } from "../../../../src/store/multiSensitivity/state";
import ErrorInfo from "../../../../src/components/ErrorInfo.vue";
import SensitivitySummaryDownload from "../../../../src/components/sensitivity/SensitivitySummaryDownload.vue";
import { getters as graphsGetters } from "../../../../src/store/graphs/getters";

describe("MultiSensitivityTab", () => {
    const mockRunMultiSensitivity = vi.fn();

    const getWrapper = (
        running = false,
        modelState: Partial<ModelState> = {},
        batchPars: any = {},
        multiSensitivityState: Partial<MultiSensitivityState> = {}
    ) => {
        const store = new Vuex.Store<AppState>({
            state: {} as any,
            modules: {
                graphs: {
                    namespaced: true,
                    state: {
                        config: [
                            {
                                selectedVariables: ["A"]
                            }
                        ]
                    },
                    getters: graphsGetters
                },
                model: {
                    namespaced: true,
                    state: {
                        odin: {},
                        compileRequired: false,
                        ...modelState
                    },
                    getters: {
                        hasRunner: () => true
                    }
                } as any,
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        running,
                        result: {
                            batch: {
                                solutions: [{}]
                            },
                            error: null
                        },
                        sensitivityUpdateRequired: {},
                        ...multiSensitivityState
                    },
                    actions: {
                        [MultiSensitivityAction.RunMultiSensitivity]: mockRunMultiSensitivity
                    },
                    getters: {
                        batchPars: () => batchPars
                    }
                } as any
            }
        });

        return shallowMount(MultiSensitivityTab, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading button in loading state when multi-sensitivity is running", () => {
        const wrapper = getWrapper(true);
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(true);
    });

    it("renders loading button in non-loading state when multi-sensitivity is not running", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingButton).props("loading")).toBe(false);
    });

    it("Run button is enabled when multi-sensitivity prerequisites are ready and batchPars can be generated", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(false);
    });

    it("Run button is not enabled when multi-sensitivity prerequisites are not ready", () => {
        const wrapper = getWrapper(false, { odin: null });
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("Run button is not enabled when batchPars cannot be generated", () => {
        const wrapper = getWrapper(false, {}, null);
        expect(wrapper.findComponent(LoadingButton).props("isDisabled")).toBe(true);
    });

    it("runs multi-sensitivity when click button", async () => {
        const wrapper = getWrapper();
        await wrapper.findComponent(LoadingButton).trigger("click");
        await new Promise((r) => setTimeout(r, 101));
        expect(mockRunMultiSensitivity).toHaveBeenCalledTimes(1);
    });

    it("renders updateMsg into ActionRequiredMessage component", () => {
        let wrapper = getWrapper();
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe("");
        wrapper = getWrapper(false, { compileRequired: true });
        expect(wrapper.findComponent(ActionRequiredMessage).props("message")).toBe(
            "Model code has been updated. Compile code and Run Multi-sensitivity to update."
        );
    });

    it("renders multi-sensitivity run result status message when there are no results yet", () => {
        const wrapper = getWrapper(
            false,
            {},
            {},
            {
                result: null
            }
        );
        expect(wrapper.find("div.multi-sensitivity-status").text()).toBe("Multi-sensitivity has not been run.");
    });

    it("renders multi-sensitivity run result status message when there are some results", () => {
        const wrapper = getWrapper(
            false,
            {},
            {},
            {
                result: {
                    batch: {
                        solutions: [{ values: [1] }, { values: [2] }, { values: [3] }]
                    }
                } as any
            }
        );
        expect(wrapper.find("div.multi-sensitivity-status").text()).toBe("Multi-sensitivity run produced 3 solutions.");
    });

    it("renders ErrorInfo as expected when no result error", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
    });

    it("renders ErrorInfo as expected when there is a result error", () => {
        const error = { error: "test error", detail: "test detail" };
        const wrapper = getWrapper(
            false,
            {},
            {},
            {
                result: {
                    error
                } as any
            }
        );
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
    });

    it("renders SensitivitySummaryDownload", () => {
        const wrapper = getWrapper();
        const download = wrapper.findComponent(SensitivitySummaryDownload);
        expect(download.props("multiSensitivity")).toBe(true);
        expect(download.props("downloadType")).toBe("Multi-sensitivity Summary");
    });
});
