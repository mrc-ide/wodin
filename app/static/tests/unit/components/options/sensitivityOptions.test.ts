import Vuex from "vuex";
import { DOMWrapper, mount } from "@vue/test-utils";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { BasicState } from "../../../../src/app/store/basic/state";
import SensitivityOptions from "../../../../src/app/components/options/SensitivityOptions.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import { SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import SensitivityParamValues from "../../../../src/app/components/options/SensitivityParamValues.vue";
import SensitivityPlotOptions from "../../../../src/app/components/options/SensitivityPlotOptions.vue";
import { MultiSensitivityGetter } from "../../../../src/app/store/multiSensitivity/getters";
import SensitivityParamSettingsModal from "../../../../src/app/components/options/SensitivityParamSettingsModal.vue";
import MultiSensitivityParamSettingsModal
    from "../../../../src/app/components/options/MultiSensitivityParamSettingsModal.vue";

const mockTooltipDirective = jest.fn();

describe("SensitivityOptions", () => {
    const mockBatchPars = {
        values: [1, 2, 3],
        name: "B"
    } as any;

    const mockMultiBatchPars = [
        {
            value: [2, 3, 4],
            name: "C"
        },
        {
            value: [5, 6],
            name: "D"
        }
    ] as any;

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
            props: {
                multiSensitivity: false
            },
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    const getWrapperForMultiSensitivity = (paramSettings: SensitivityParameterSettings[]) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings
                    },
                    getters: {
                        [MultiSensitivityGetter.multiBatchPars]: () => mockMultiBatchPars
                    }
                },
                model: {
                },
                run: {
                    namespaced: true,
                    state: {
                        parameterValues: {}
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
            props: {
                multiSensitivity: true
            },
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    const percentSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5
    };

    const rangeSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Range,
        variationPercentage: 10,
        rangeFrom: 1,
        rangeTo: 3,
        numberOfRuns: 5
    };

    const expectPercentSettings = (listItems: DOMWrapper<Element>[]) => {
        expect(listItems.length).toBe(5);
        expect(listItems.at(0)!.text()).toBe("Parameter: B");
        expect(listItems.at(1)!.text()).toBe("Scale Type: Arithmetic");
        expect(listItems.at(2)!.text()).toBe("Variation Type: Percentage");
        expect(listItems.at(3)!.text()).toBe("Variation (%): 10");
        expect(listItems.at(4)!.text()).toBe("Number of runs: 5");
    };

    it("displays percentage variance as expected", () => {
        const wrapper = getWrapper(percentSettings);

        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Sensitivity Options");
        expect(wrapper.findComponent(VerticalCollapse).props("collapseId")).toBe("sensitivity-options");

        const listItems = wrapper.findAll("ul li");
        expectPercentSettings(listItems);

        expect(wrapper.find("#sensitivity-options").findComponent(SensitivityParamValues)
            .props("batchPars")).toBe(mockBatchPars);

        expect(wrapper.find("button.btn-primary").text()).toBe("Edit");
        expect(wrapper.findComponent(SensitivityParamSettingsModal).props("open")).toBe(false);

        expect(wrapper.find("#sensitivity-options-msg").exists()).toBe(false);

        expect(wrapper.findComponent(SensitivityPlotOptions).exists()).toBe(true);
    });

    const expectRangeSettings = (listItems: DOMWrapper<Element>[]) => {
        expect(listItems.length).toBe(6);
        expect(listItems.at(0)!.text()).toBe("Parameter: B");
        expect(listItems.at(1)!.text()).toBe("Scale Type: Logarithmic");
        expect(listItems.at(2)!.text()).toBe("Variation Type: Range");
        expect(listItems.at(3)!.text()).toBe("From: 1");
        expect(listItems.at(4)!.text()).toBe("To: 3");
        expect(listItems.at(5)!.text()).toBe("Number of runs: 5");
    };

    it("displays range variance as expected", () => {
        const wrapper = getWrapper(rangeSettings);

        const listItems = wrapper.findAll("ul li");
        expectRangeSettings(listItems);
    });

    it("renders as expected for MultiSensitivity", () => {
        const wrapper = getWrapperForMultiSensitivity([rangeSettings, percentSettings]);
        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Multi-sensitivity Options");
        const settings = wrapper.findAll("div.sensitivity-options-settings");
        expect(settings.length).toBe(2);
        const listItems1 = settings[0].findAll("ul li");
        expectRangeSettings(listItems1);
        const listItems2 = settings[1].findAll("ul li");
        expectPercentSettings(listItems2);

        expect(settings[0].findComponent(SensitivityParamValues).props("batchPars")).toBe(mockMultiBatchPars[0]);
        expect(settings[1].findComponent(SensitivityParamValues).props("batchPars")).toBe(mockMultiBatchPars[1]);
    });

    it("opens and closes edit dialog", async () => {
        const wrapper = getWrapper(percentSettings);
        await wrapper.find("button,btn-primary").trigger("click");
        const modal = wrapper.findComponent(SensitivityParamSettingsModal);
        expect(modal.props("open")).toBe(true);

        await modal.vm.$emit("close");
        expect(modal.props("open")).toBe(false);
    });

    it("opens and closes edit dialog for multi-sensitivity", async () => {
        const wrapper = getWrapperForMultiSensitivity([percentSettings]);
        await wrapper.find("button,btn-primary").trigger("click");
        const modal = wrapper.findComponent(MultiSensitivityParamSettingsModal);
        expect(modal.props("open")).toBe(true);

        await modal.vm.$emit("close");
        expect(modal.props("open")).toBe(false);
    });

    it("displays message if no parameter to vary", () => {
        const wrapper = getWrapper({ parameterToVary: null } as any);
        expect(wrapper.find("ul").exists()).toBe(false);
        expect(wrapper.find("#sensitivity-options-msg").text())
            .toBe("Please compile a valid model in order to set sensitivity options.");
        expect(wrapper.find("#sensitivity-options").findComponent(SensitivityParamValues).exists()).toBe(false);
        expect(wrapper.findComponent(SensitivityPlotOptions).exists()).toBe(false);
    });
});
