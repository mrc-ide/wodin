import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { BasicState } from "../../../../src/app/store/basic/state";
import SensitivityOptions from "../../../../src/app/components/options/SensitivityOptions.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";

describe("SensitivityOptions", () => {
    const getWrapper = (paramSettings: SensitivityParameterSettings) => {
        const store = new Vuex.Store<BasicState>({
            state: {
                sensitivity: { paramSettings },
                model: {
                    parameterValues: new Map<string, number>()
                }
            } as any
        });
        return mount(SensitivityOptions, {
            global: {
                plugins: [store]
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

    it("displays percentage variance as expected", () => {
        const wrapper = getWrapper(percentSettings);

        expect(wrapper.find("h5").text()).toBe("Sensitivity Options");
        expect(wrapper.findComponent(VerticalCollapse).props("title")).toBe("Vary Parameter");
        expect(wrapper.findComponent(VerticalCollapse).props("collapseId")).toBe("vary-parameter");

        expect(wrapper.find(".card-header").text()).toBe("B");
        const listItems = wrapper.findAll(".card-body ul li");
        expect(listItems.length).toBe(4);
        expect(listItems.at(0)!.text()).toBe("Scale Type: Arithmetic");
        expect(listItems.at(1)!.text()).toBe("Variation Type: Percentage");
        expect(listItems.at(2)!.text()).toBe("Variation (%): 10");
        expect(listItems.at(3)!.text()).toBe("Number of runs: 5");

        expect(wrapper.find("button.btn-primary").text()).toBe("Edit");
        expect(wrapper.findComponent(EditParamSettings).props("open")).toBe(false);

        expect(wrapper.find("#sensitivity-options-msg").exists()).toBe(false);
    });

    it("displays range variance as expected", () => {
        const wrapper = getWrapper({
            parameterToVary: "B",
            scaleType: SensitivityScaleType.Logarithmic,
            variationType: SensitivityVariationType.Range,
            variationPercentage: 10,
            rangeFrom: 1,
            rangeTo: 3,
            numberOfRuns: 5
        });

        expect(wrapper.find(".card-header").text()).toBe("B");
        const listItems = wrapper.findAll(".card-body ul li");
        expect(listItems.length).toBe(5);
        expect(listItems.at(0)!.text()).toBe("Scale Type: Logarithmic");
        expect(listItems.at(1)!.text()).toBe("Variation Type: Range");
        expect(listItems.at(2)!.text()).toBe("From: 1");
        expect(listItems.at(3)!.text()).toBe("To: 3");
        expect(listItems.at(4)!.text()).toBe("Number of runs: 5");
    });

    it("opens and closes edit dialog", async () => {
        const wrapper = getWrapper(percentSettings);
        await wrapper.find("button,btn-primary").trigger("click");
        const editParamSettings = wrapper.findComponent(EditParamSettings);
        expect(editParamSettings.props("open")).toBe(true);

        await editParamSettings.vm.$emit("close");
        expect(editParamSettings.props("open")).toBe(false);
    });

    it("displays message if no parameter to vary", () => {
        const wrapper = getWrapper({ parameterToVary: null } as any);
        expect(wrapper.findComponent(VerticalCollapse).exists()).toBe(false);
        expect(wrapper.find("#sensitivity-options-msg").text())
            .toBe("Please compile a valid model in order to set sensitivity options.");
    });
});
