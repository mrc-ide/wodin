import Vuex from "vuex";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DownloadOutput from "../../../../src/app/components/DownloadOutput.vue";
import { AppState } from "../../../../src/app/store/appState/state";
import {
    BaseSensitivityState,
    SensitivityPlotType,
    SensitivityState
} from "../../../../src/app/store/sensitivity/state";
import SensitivitySummaryDownload from "../../../../src/app/components/sensitivity/SensitivitySummaryDownload.vue";
import { BaseSensitivityAction, SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { BaseSensitivityMutation, SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import { ModelGetter } from "../../../../src/app/store/model/getters";

describe("SensitivitySummaryDownload", () => {
    const mockSetUserSummaryDownloadFileName = jest.fn();
    const mockDownloadSummary = jest.fn();
    const mockSetPlotTime = jest.fn();

    const getWrapper = (multiSens = false, state: Partial<BaseSensitivityState> = {}) => {
        const plotSettings = {
            plotType: SensitivityPlotType.TraceOverTime,
            time: null
        };

        const sensMod = {
            namespaced: true,
            state: {
                userSummaryDownloadFileName: "",
                result: {
                    inputs: {},
                    batch: {
                        solutions: [],
                        errors: []
                    },
                    error: null
                },
                plotSettings: multiSens ? undefined : plotSettings,
                ...state
            },
            actions: {
                [BaseSensitivityAction.DownloadSummary]: mockDownloadSummary
            },
            mutations: {
                [BaseSensitivityMutation.SetUserSummaryDownloadFileName]: mockSetUserSummaryDownloadFileName,
                [SensitivityMutation.SetPlotTime]: multiSens ? jest.fn() : mockSetPlotTime
            }
        };
        const minimalSensitivity = {
            namespaced: true,
            state: {
                plotSettings
            },
            mutations: {
                [SensitivityMutation.SetPlotTime]: mockSetPlotTime
            }
        } as any;

        const store = new Vuex.Store<AppState>({
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        odinRunnerOde: {},
                        odin: {},
                        selectedVariables: ["S"]
                    },
                    getters: {
                        [ModelGetter.hasRunner]: () => true
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100
                    }
                },
                multiSensitivity: multiSens ? sensMod : ({} as any),
                sensitivity: multiSens ? minimalSensitivity : sensMod
            }
        });

        return shallowMount(SensitivitySummaryDownload, {
            props: {
                multiSensitivity: multiSens,
                downloadType: "Test Download Type"
            },
            global: {
                plugins: [store]
            }
        });
    };

    const testForSensAndMultiSens = (
        test: (wrapper: VueWrapper<any>, multiSens: boolean) => void,
        state: Partial<SensitivityState> = {}
    ) => {
        let wrapper = getWrapper(false, state);
        test(wrapper, false);
        jest.clearAllMocks();
        wrapper = getWrapper(true, state);
        test(wrapper, true);
    };

    const asyncTestForSensAndMultiSens = async (
        test: (wrapper: VueWrapper<any>, multiSens: boolean) => Promise<void>,
        state: Partial<SensitivityState> = {}
    ) => {
        let wrapper = getWrapper(false, state);
        await test(wrapper, false);
        jest.clearAllMocks();
        wrapper = getWrapper(true, state);
        await test(wrapper, true);
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("enables download button when expected", () => {
        const expectDownloadButtonEnabled = (state: Partial<BaseSensitivityState>, expectButtonEnabled: boolean) => {
            testForSensAndMultiSens((wrapper) => {
                const button = wrapper.find("button#download-summary-btn");
                expect((button.element as HTMLButtonElement).disabled).toBe(!expectButtonEnabled);
            }, state);
        };

        // enabled if not downloading, and no update required, and batch result exists
        const noUpdateRequiredReasons = {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        };
        const enabledResult = {
            inputs: {},
            batch: {
                solutions: ["test solution"] as any,
                errors: []
            },
            error: null
        };
        const enabledState = {
            downloading: false,
            sensitivityUpdateRequired: noUpdateRequiredReasons,
            result: enabledResult
        } as any;
        expectDownloadButtonEnabled(enabledState, true);

        // disabled if downloading
        expectDownloadButtonEnabled({ ...enabledState, downloading: true }, false);

        // disabled if update required
        expectDownloadButtonEnabled(
            {
                ...enabledState,
                sensitivityUpdateRequired: { modelChanged: true }
            },
            false
        );

        // disabled if no batch result
        expectDownloadButtonEnabled(
            {
                ...enabledState,
                result: { ...enabledResult, batch: null }
            },
            false
        );
    });

    it("renders DownloadOutput as expected", () => {
        const state = { userSummaryDownloadFileName: "test.xlsx" };
        testForSensAndMultiSens((wrapper) => {
            const downloadOutput = wrapper.findComponent(DownloadOutput);
            expect(downloadOutput.props().open).toBe(false);
            expect(downloadOutput.props().downloadType).toBe("Test Download Type");
            expect(downloadOutput.props().includePoints).toBe(false);
            expect(downloadOutput.props().userFileName).toBe("test.xlsx");
        }, state);
    });

    it("renders downloading as expected", () => {
        testForSensAndMultiSens((wrapper) => {
            // does not render if not downloading
            expect(wrapper.find("div#downloading").exists()).toBe(false);
        });

        // does render if downloading
        const state = { downloading: true };
        testForSensAndMultiSens((wrapper) => {
            const downloading = wrapper.find("div#downloading");
            expect(downloading.text()).toBe("Downloading...");
            expect(wrapper.findComponent(LoadingSpinner).props("size")).toBe("xs");
        }, state);
    });

    it("opens dialog on click download button", async () => {
        const wrapper = getWrapper();
        const button = wrapper.find("button#download-summary-btn");
        expect((button.element as HTMLButtonElement).disabled).toBe(false);
        await button.trigger("click");
        expect(wrapper.findComponent(DownloadOutput).props().open).toBe(true);
    });

    it("commits user download filename change", () => {
        testForSensAndMultiSens((wrapper) => {
            const downloadOutput = wrapper.findComponent(DownloadOutput);
            downloadOutput.vm.$emit("update:userFileName", "newFile.xlsx");
            expect(mockSetUserSummaryDownloadFileName).toHaveBeenCalledTimes(1);
            expect(mockSetUserSummaryDownloadFileName.mock.calls[0][1]).toBe("newFile.xlsx");
        });
    });

    it("verifies end time and dispatches action on download output emit", () => {
        testForSensAndMultiSens((wrapper) => {
            const downloadOutput = wrapper.findComponent(DownloadOutput);
            downloadOutput.vm.$emit("download", { fileName: "test.xlsx" });
            // should have updated plot settings time to run end time
            expect(mockSetPlotTime).toHaveBeenCalledTimes(1);
            expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
            expect(mockDownloadSummary.mock.calls[0][1]).toBe("test.xlsx");
        });
    });

    it("closes output dialog on close emit", async () => {
        await asyncTestForSensAndMultiSens(async (wrapper) => {
            await wrapper.find("#download-summary-btn").trigger("click");
            const downloadOutput = wrapper.findComponent(DownloadOutput);
            expect(downloadOutput.props().open).toBe(true);
            downloadOutput.vm.$emit("close");
            await nextTick();
            expect(downloadOutput.props().open).toBe(false);
        });
    });
});
