import DownloadOutput from "../../../../src/app/components/DownloadOutput.vue";
import {AppState, AppType} from "../../../../src/app/store/appState/state";
import {ModelState} from "../../../../src/app/store/model/state";
import {BaseSensitivityState, SensitivityPlotType, SensitivityState} from "../../../../src/app/store/sensitivity/state";
import Vuex from "vuex";
import {shallowMount} from "@vue/test-utils";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import SensitivitySummaryDownload from "../../../../src/app/components/sensitivity/SensitivitySummaryDownload.vue";
import {BaseSensitivityAction, SensitivityAction} from "../../../../src/app/store/sensitivity/actions";
import {BaseSensitivityMutation, SensitivityMutation} from "../../../../src/app/store/sensitivity/mutations";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import {nextTick} from "vue";
import {ModelGetter} from "../../../../src/app/store/model/getters";

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
                multiSensitivity: multiSens ? sensMod : {} as any,
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

    it("enables download button when expected", () => {
        const expectDownloadButtonEnabled = (state: Partial<SensitivityState>, expectButtonEnabled: boolean) => {
            const wrapper = getWrapper(false, state);
            const button = wrapper.find("button#download-summary-btn");
            expect((button.element as HTMLButtonElement).disabled).toBe(!expectButtonEnabled);
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
        expectDownloadButtonEnabled({
            ...enabledState,
            sensitivityUpdateRequired: { modelChanged: true }
        }, false);

        // disabled if no batch result
        expectDownloadButtonEnabled({
            ...enabledState,
            result: { ...enabledResult, batch: null }
        }, false);
    });

    it("renders DownloadOutput as expected", () => {
        const wrapper = getWrapper(false,{ userSummaryDownloadFileName: "test.xlsx" });
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        expect(downloadOutput.props().open).toBe(false);
        expect(downloadOutput.props().downloadType).toBe("Test Download Type");
        expect(downloadOutput.props().includePoints).toBe(false);
        expect(downloadOutput.props().userFileName).toBe("test.xlsx");
    });

    it("renders downloading as expected", () => {
        // does not render if not downloading
        let wrapper = getWrapper();
        expect(wrapper.find("div#downloading").exists()).toBe(false);

        // does render if downloading
        wrapper = getWrapper(false, { downloading: true });
        const downloading = wrapper.find("div#downloading");
        expect(downloading.text()).toBe("Downloading...");
        expect(wrapper.findComponent(LoadingSpinner).props("size")).toBe("xs");
    });

    it("opens dialog on click download button", async () => {
        const wrapper = getWrapper();
        const button = wrapper.find("button#download-summary-btn");
        expect((button.element as HTMLButtonElement).disabled).toBe(false)
        await button.trigger("click");
        expect(wrapper.findComponent(DownloadOutput).props().open).toBe(true);
    });

    it("commits user download filename change", () => {
        const wrapper = getWrapper();
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        downloadOutput.vm.$emit("update:userFileName", "newFile.xlsx");
        expect(mockSetUserSummaryDownloadFileName).toHaveBeenCalledTimes(1);
        expect(mockSetUserSummaryDownloadFileName.mock.calls[0][1]).toBe("newFile.xlsx");
    });

    it("verifies end time and dispatches action on download output emit", () => {
        const wrapper = getWrapper();
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        downloadOutput.vm.$emit("download", { fileName: "test.xlsx" });
        // should have updated plot settings time to run end time
        expect(mockSetPlotTime).toHaveBeenCalledTimes(1);
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expect(mockDownloadSummary.mock.calls[0][1]).toBe("test.xlsx");
    });

    it("closes output dialog on close emit", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#download-summary-btn").trigger("click");
        const downloadOutput = wrapper.findComponent(DownloadOutput);
        expect(downloadOutput.props().open).toBe(true);
        downloadOutput.vm.$emit("close");
        await nextTick();
        expect(downloadOutput.props().open).toBe(false);
    });

    // TODO: test all for multisens
});