import Vuex from "vuex";
import { DOMWrapper, mount, VueWrapper } from "@vue/test-utils";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { BasicState } from "../../../../src/app/store/basic/state";
import SensitivityOptions from "../../../../src/app/components/options/SensitivityOptions.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";
import { SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityParamValues from "../../../../src/app/components/options/SensitivityParamValues.vue";
import SensitivityPlotOptions from "../../../../src/app/components/options/SensitivityPlotOptions.vue";
import { MultiSensitivityGetter } from "../../../../src/app/store/multiSensitivity/getters";
import { BatchPars } from "../../../../src/app/types/responseTypes";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { MultiSensitivityMutation } from "../../../../src/app/store/multiSensitivity/mutations";
import { defaultSensitivityParamSettings } from "../../../../src/app/store/sensitivity/sensitivity";

const mockTooltipDirective = jest.fn();

describe("SensitivityOptions", () => {
    const mockBatchPars = {
        varying: [{
            name: "A",
            values: [1, 2, 3]
        }]
    } as any;

    const mockMultiBatchPars = [
        mockBatchPars,
        {
            varying: [{
                name: "B",
                values: [4, 5]
            }]
        },
        {
            varying: [{
                name: "C",
                values: [6, 7, 8]
            }]
        }
    ] as any;

    const mockSensitivitySetParamSettings = jest.fn();
    const mockMultiSensitivitySetParamSettings = jest.fn();

    const getWrapper = (paramSettings: SensitivityParameterSettings) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings,
                        plotSettings: {}
                    },
                    getters: {
                        [SensitivityGetter.batchPars]: () => mockBatchPars
                    },
                    mutations: {
                        [SensitivityMutation.SetParamSettings]: mockSensitivitySetParamSettings
                    }
                },
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings: []
                    }
                },
                model: {
                },
                run: {
                    namespaced: true,
                    state: {
                        parameterValues: {}
                    }
                }
            } as any
        });
        return mount(SensitivityOptions, {
            props: { multiSensitivity: false },
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    const getWrapperForMultiSensitivity = ((paramSettings: SensitivityParameterSettings[]) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings
                    },
                    getters: {
                        [MultiSensitivityGetter.batchPars]: () => mockMultiBatchPars
                    },
                    mutations: {
                        [MultiSensitivityMutation.SetParamSettings]: mockMultiSensitivitySetParamSettings
                    }
                },
                model: {
                },
                run: {
                    namespaced: true,
                    state: {
                        parameterValues: {
                            A: 1,
                            B: 2,
                            C: 3,
                            D: 4
                        }
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        plotSettings: {}
                    }
                }
            } as any
        });
        return mount(SensitivityOptions, {
            props: { multiSensitivity: true },
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    });

    const percentSettings = {
        parameterToVary: "A",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5,
        customValues: []
    };

    const rangeSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Range,
        variationPercentage: 10,
        rangeFrom: 1,
        rangeTo: 3,
        numberOfRuns: 5,
        customValues: []
    };

    const customSettings = {
        parameterToVary: "C",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Custom,
        variationPercentage: 10,
        rangeFrom: 1,
        rangeTo: 3,
        numberOfRuns: 5,
        customValues: [1, 2, 3]
    };

    const expectEditButton = (wrapper: DOMWrapper<Element>) => {
        expect(wrapper.find(".edit-param-settings").exists()).toBe(true);
    };

    const expectDeleteButton = (wrapper: DOMWrapper<Element>, exists = true) => {
        expect(wrapper.find(".delete-param-settings").exists()).toBe(exists);
    };

    const expectAddButton = (wrapper: VueWrapper<any>, exists = true) => {
        expect(wrapper.find("button.add-param-settings").exists()).toBe(exists);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectPercentSettings = (wrapper: DOMWrapper<Element>, batchPars: BatchPars) => {
        const listItems = wrapper.findAll("ul li");
        expect(listItems.length).toBe(5);
        expect(listItems.at(0)!.text()).toBe("Parameter: A");
        expect(listItems.at(1)!.text()).toBe("Variation Type: Percentage");
        expect(listItems.at(2)!.text()).toBe("Scale Type: Arithmetic");
        expect(listItems.at(3)!.text()).toBe("Variation (%): 10");
        expect(listItems.at(4)!.text()).toBe("Number of runs: 5");

        expect(wrapper.findComponent(SensitivityParamValues).props("batchPars")).toBe(batchPars);

        expectEditButton(wrapper);
    };

    it("displays percentage variance as expected", () => {
        const wrapper = getWrapper(percentSettings);

        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Sensitivity Options");
        expect(wrapper.findComponent(VerticalCollapse).props("collapseId")).toBe("sensitivity-options");

        const optionsSettings = wrapper.find(".sensitivity-options-settings");
        expectPercentSettings(optionsSettings, mockBatchPars);
        expect(wrapper.findComponent(EditParamSettings).props("open")).toBe(false);

        expect(wrapper.find("#sensitivity-options-msg").exists()).toBe(false);

        expect(wrapper.findComponent(SensitivityPlotOptions).exists()).toBe(true);
        expectDeleteButton(optionsSettings, false);
        expectAddButton(wrapper, false);
    });

    const expectRangeSettings = (wrapper: DOMWrapper<Element>, batchPars: BatchPars) => {
        const listItems = wrapper.findAll("ul li");
        expect(listItems.length).toBe(6);
        expect(listItems.at(0)!.text()).toBe("Parameter: B");
        expect(listItems.at(1)!.text()).toBe("Variation Type: Range");
        expect(listItems.at(2)!.text()).toBe("Scale Type: Logarithmic");
        expect(listItems.at(3)!.text()).toBe("From: 1");
        expect(listItems.at(4)!.text()).toBe("To: 3");
        expect(listItems.at(5)!.text()).toBe("Number of runs: 5");

        expect(wrapper.findComponent(SensitivityParamValues).props("batchPars")).toBe(batchPars);
        expectEditButton(wrapper);
    };

    it("displays range variance as expected", () => {
        const wrapper = getWrapper(rangeSettings);
        const optionsSettings = wrapper.find(".sensitivity-options-settings");
        expectRangeSettings(optionsSettings, mockBatchPars);
        expectDeleteButton(optionsSettings, false);
        expectAddButton(wrapper, false);
    });

    const expectCustomSettings = (wrapper: DOMWrapper<Element>) => {
        const listItems = wrapper.findAll("ul li");
        expect(listItems.length).toBe(3);
        expect(listItems.at(0)!.text()).toBe("Parameter: C");
        expect(listItems.at(1)!.text()).toBe("Variation Type: Custom");
        expect(listItems.at(2)!.text()).toBe("Values: 1, 2, 3");
        expect(wrapper.findComponent(SensitivityParamValues).exists()).toBe(false);
        expectEditButton(wrapper);
    };

    it("displays custom values as expected", () => {
        const wrapper = getWrapper(customSettings);
        const optionsSettings = wrapper.find(".sensitivity-options-settings");
        expectCustomSettings(optionsSettings);
        expectDeleteButton(optionsSettings, false);
        expectAddButton(wrapper, false);
    });

    it("renders as expected for multi-sensitivity", () => {
        const wrapper = getWrapperForMultiSensitivity([
            percentSettings,
            rangeSettings,
            customSettings
        ]);
        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Multi-sensitivity Options");
        expect(wrapper.findComponent(VerticalCollapse).props("collapseId")).toBe("sensitivity-options");
        const allSettingsDivs = wrapper.findAll(".sensitivity-options-settings");
        expect(allSettingsDivs.length).toBe(3);
        expectPercentSettings(allSettingsDivs[0], mockMultiBatchPars[0]);
        expectDeleteButton(allSettingsDivs[0]);

        expectRangeSettings(allSettingsDivs[1], mockMultiBatchPars[1]);
        expectDeleteButton(allSettingsDivs[1]);

        expectCustomSettings(allSettingsDivs[2]);
        expectDeleteButton(allSettingsDivs[2]);

        expectAddButton(wrapper);
    });

    it("opens and closes edit dialog for sensitivity", async () => {
        const wrapper = getWrapper(percentSettings);
        await wrapper.find(".edit-param-settings").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        expect(editParamSettings.props("open")).toBe(true);
        expect(editParamSettings.props("paramSettings")).toStrictEqual(percentSettings);

        await editParamSettings.vm.$emit("close");
        expect(editParamSettings.props("open")).toBe(false);
    });

    it("opens and closes edit dialog for multi-sensitivity", async () => {
        const wrapper = getWrapperForMultiSensitivity([percentSettings, rangeSettings]);
        const allSettingsDivs = wrapper.findAll(".sensitivity-options-settings");
        await allSettingsDivs[0].find(".edit-param-settings").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        expect(editParamSettings.props("open")).toBe(true);
        expect(editParamSettings.props("paramSettings")).toStrictEqual(percentSettings);

        await editParamSettings.vm.$emit("close");
        expect(editParamSettings.props("open")).toBe(false);

        await allSettingsDivs[1].find(".edit-param-settings").trigger("click");
        expect(editParamSettings.props("open")).toBe(true);
        expect(editParamSettings.props("paramSettings")).toStrictEqual(rangeSettings);
    });

    it("displays message if no parameter to vary", () => {
        const wrapper = getWrapper({ parameterToVary: null } as any);
        expect(wrapper.find("ul").exists()).toBe(false);
        expect(wrapper.find("#sensitivity-options-msg").text())
            .toBe("Please compile a valid model in order to set sensitivity options.");
        expect(wrapper.find("#sensitivity-options").findComponent(SensitivityParamValues).exists()).toBe(false);
        expect(wrapper.findComponent(SensitivityPlotOptions).exists()).toBe(false);
    });

    it("saves edited sensitivity param settings", async () => {
        const wrapper = getWrapper(percentSettings);
        await wrapper.find(".edit-param-settings").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        await editParamSettings.vm.$emit("update", { ...rangeSettings });
        expect(mockSensitivitySetParamSettings).toHaveBeenCalledTimes(1);
        expect(mockSensitivitySetParamSettings.mock.calls[0][1]).toStrictEqual(rangeSettings);
        expect(mockMultiSensitivitySetParamSettings).not.toHaveBeenCalled();
    });

    it("saves edited multi-sensitivity param settings", async () => {
        const wrapper = getWrapperForMultiSensitivity([customSettings, percentSettings]);
        const allSettingsDivs = wrapper.findAll(".sensitivity-options-settings");
        await allSettingsDivs[1].find(".edit-param-settings").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        await editParamSettings.vm.$emit("update", { ...rangeSettings });
        expect(mockMultiSensitivitySetParamSettings).toHaveBeenCalledTimes(1);
        expect(mockMultiSensitivitySetParamSettings.mock.calls[0][1]).toStrictEqual([customSettings, rangeSettings]);
        expect(mockSensitivitySetParamSettings).not.toHaveBeenCalled();
    });

    it("opens editor with default new settings when click Add button", async () => {
        const settings = [customSettings, percentSettings];
        const wrapper = getWrapperForMultiSensitivity(settings);
        await wrapper.find("#add-param-settings").trigger("click");

        const editParamSettings = wrapper.findComponent(EditParamSettings);
        expect(editParamSettings.props("open")).toBe(true);
        expect(editParamSettings.props("paramSettings")).toStrictEqual({
            ...defaultSensitivityParamSettings(),
            parameterToVary: "B"
        });
        expect(mockMultiSensitivitySetParamSettings).not.toHaveBeenCalled();
    });

    it("saves added multi-sensitivity param settings", async () => {
        const settings = [customSettings, percentSettings];
        const wrapper = getWrapperForMultiSensitivity(settings);
        await wrapper.find("#add-param-settings").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        await editParamSettings.vm.$emit("update", { ...rangeSettings });
        expect(mockMultiSensitivitySetParamSettings).toHaveBeenCalledTimes(1);
        // The first parameter not already in the settings should be B
        expect(mockMultiSensitivitySetParamSettings.mock.calls[0][1]).toStrictEqual([
            ...settings,
            rangeSettings
        ]);
    });

    it("can edit setting after closing editor on add", async () => {
        const settings = [customSettings, percentSettings];
        const wrapper = getWrapperForMultiSensitivity(settings);
        await wrapper.find("#add-param-settings").trigger("click");
        expect((wrapper.vm as any).addingParamSettings).toBe(true);
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        editParamSettings.vm.$emit("close");
        expect((wrapper.vm as any).addingParamSettings).toBe(false);
        await wrapper.find(".edit-param-settings").trigger("click");
        expect(editParamSettings.props("paramSettings")).toStrictEqual(customSettings);
    });

    it("deletes param settings when click Delete button", async () => {
        const settings = [customSettings, percentSettings, rangeSettings];
        const wrapper = getWrapperForMultiSensitivity(settings);
        const allSettingsDivs = wrapper.findAll(".sensitivity-options-settings");
        await allSettingsDivs[1].find(".delete-param-settings").trigger("click");
        expect(mockMultiSensitivitySetParamSettings).toHaveBeenCalledTimes(1);
        // The first parameter not already in the settings should be B
        expect(mockMultiSensitivitySetParamSettings.mock.calls[0][1])
            .toStrictEqual([customSettings, rangeSettings]);
    });

    it("does not display delete button when there is only one param settings", () => {
        const wrapper = getWrapperForMultiSensitivity([percentSettings]);
        expect(wrapper.find(".delete-param-settings").exists()).toBe(false);
    });

    it("removes add button when all parameters have settings", () => {
        const wrapper = getWrapperForMultiSensitivity([
            percentSettings, // param A
            rangeSettings, // param B
            customSettings, // param C
            { ...rangeSettings, parameterToVary: "D" }
        ]);
        expect(wrapper.find("#add-param-settings").exists()).toBe(false);
    });
});
