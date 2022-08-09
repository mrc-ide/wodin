import Vuex from "vuex";
import { mount, VueWrapper } from "@vue/test-utils";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

describe("EditParamSettings", () => {
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
        parameterToVary: "A",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Range,
        variationPercentage: 0,
        rangeFrom: 2,
        rangeTo: 6,
        numberOfRuns: 5
    };

    const getWrapper = async (paramSettings: SensitivityParameterSettings, open = true,
        mockSetParamSettings = jest.fn()) => {
        const parameterValues = new Map<string, number>();
        parameterValues.set("A", 1);
        parameterValues.set("B", 2);
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        parameterValues
                    })
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings
                    },
                    mutations: {
                        [SensitivityMutation.SetParamSettings]: mockSetParamSettings
                    }
                }
            }
        });
        const wrapper = mount(EditParamSettings, {
            global: {
                plugins: [store]
            },
            props: {
                open: false
            }
        });

        // We open after mounting to trigger the component to take an internal copy of store settings to edit
        if (open) {
            await wrapper.setProps({ open: true });
        }
        return wrapper;
    };

    it("renders as expected when variation type is Percentage", async () => {
        const wrapper = await getWrapper(percentSettings);

        expect(wrapper.find(".modal").classes()).toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("block");
        expect(wrapper.find(".modal-backdrop").exists()).toBe(true);

        expect(wrapper.find(".modal-header").text()).toBe("Vary Parameter");

        expect(wrapper.find("#edit-param-to-vary label").text()).toBe("Parameter to vary");
        const paramSelect = wrapper.find("#edit-param-to-vary select");
        expect((paramSelect.element as HTMLSelectElement).value).toBe("B");
        const paramOptions = paramSelect.findAll("option");
        expect(paramOptions.length).toBe(2);
        expect(paramOptions.at(0)!.text()).toBe("A");
        expect(paramOptions.at(1)!.text()).toBe("B");

        expect(wrapper.find("#edit-scale-type label").text()).toBe("Scale type");
        const scaleSelect = wrapper.find("#edit-scale-type select");
        expect((scaleSelect.element as HTMLSelectElement).value).toBe(SensitivityScaleType.Arithmetic);
        const scaleOptions = scaleSelect.findAll("option");
        expect(scaleOptions.length).toBe(2);
        expect(scaleOptions.at(0)!.text()).toBe(SensitivityScaleType.Arithmetic);
        expect(scaleOptions.at(1)!.text()).toBe(SensitivityScaleType.Logarithmic);

        expect(wrapper.find("#edit-variation-type label").text()).toBe("Variation type");
        const varSelect = wrapper.find("#edit-variation-type select");
        expect((varSelect.element as HTMLSelectElement).value).toBe(SensitivityVariationType.Percentage);
        const varOptions = varSelect.findAll("option");
        expect(varOptions.length).toBe(2);
        expect(varOptions.at(0)!.text()).toBe(SensitivityVariationType.Percentage);
        expect(varOptions.at(1)!.text()).toBe(SensitivityVariationType.Range);

        expect(wrapper.find("#edit-percent label").text()).toBe("Variation (%)");
        expect(wrapper.find("#edit-percent").findComponent(NumericInput).props("value")).toBe(10);

        expect(wrapper.find("#edit-from").exists()).toBe(false);
        expect(wrapper.find("#edit-to").exists()).toBe(false);

        expect(wrapper.find("#edit-runs label").text()).toBe("Number of runs");
        expect(wrapper.find("#edit-runs").findComponent(NumericInput).props("value")).toBe(5);

        expect(wrapper.find(".modal-footer button.btn-primary").text()).toBe("OK");
        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).toBe(undefined);
        expect(wrapper.find(".modal-footer button.btn-outline").text()).toBe("Cancel");

        expect(wrapper.find("#invalid-msg").exists()).toBe(false);
    });

    it("renders as expected when variation type is Range", async () => {
        const wrapper = await getWrapper(rangeSettings);

        const paramSelect = wrapper.find("#edit-param-to-vary select");
        expect((paramSelect.element as HTMLSelectElement).value).toBe("A");

        const scaleSelect = wrapper.find("#edit-scale-type select");
        expect((scaleSelect.element as HTMLSelectElement).value).toBe(SensitivityScaleType.Logarithmic);

        const varSelect = wrapper.find("#edit-variation-type select");
        expect((varSelect.element as HTMLSelectElement).value).toBe(SensitivityVariationType.Range);

        expect(wrapper.find("#edit-percent").exists()).toBe(false);

        expect(wrapper.find("#edit-from label").text()).toBe("From");
        expect(wrapper.find("#edit-from").findComponent(NumericInput).props("value")).toBe(2);
        expect(wrapper.find("#edit-to label").text()).toBe("To");
        expect(wrapper.find("#edit-to").findComponent(NumericInput).props("value")).toBe(6);

        expect(wrapper.find("#edit-runs").findComponent(NumericInput).props("value")).toBe(5);

        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).toBe(undefined);
        expect(wrapper.find("#invalid-msg").exists()).toBe(false);
    });

    it("disables OK and renders message when from is not less than to", async () => {
        const settings = { ...rangeSettings, rangeFrom: 10, rangeTo: 5 };
        const wrapper = await getWrapper(settings);

        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).not.toBe(undefined);
        expect(wrapper.find("#invalid-msg").text()).toBe("To must be greater than From.");
    });

    it("hides modal if not open", async () => {
        const wrapper = await getWrapper(percentSettings, false);
        expect(wrapper.find(".modal").classes()).not.toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("none");
        expect(wrapper.find(".modal-backdrop").exists()).toBe(false);
    });

    it("closes on cancel click", async () => {
        const wrapper = await getWrapper(percentSettings);
        await wrapper.find("#cancel-settings").trigger("click");
        expect(wrapper.emitted("close")?.length).toBe(1);
    });

    const updateSelect = async (wrapper: VueWrapper<any>, rowId: string, newVal: string) => {
        const select = wrapper.find(`#${rowId} select`);
        (select.element as HTMLSelectElement).value = newVal;
        await select.trigger("change");
    };

    it("updates param settings and closes on OK click", async () => {
        const mockSetParamSettings = jest.fn();
        const wrapper = await getWrapper(percentSettings, true, mockSetParamSettings);

        await updateSelect(wrapper, "edit-param-to-vary", "A");
        await updateSelect(wrapper, "edit-scale-type", SensitivityScaleType.Logarithmic);
        await wrapper.find("#edit-percent").findComponent(NumericInput).vm.$emit("update", 15);
        await updateSelect(wrapper, "edit-variation-type", SensitivityVariationType.Range);
        await wrapper.find("#edit-from").findComponent(NumericInput).vm.$emit("update", 1);
        await wrapper.find("#edit-to").findComponent(NumericInput).vm.$emit("update", 3);
        await wrapper.find("#edit-runs").findComponent(NumericInput).vm.$emit("update", 11);

        await wrapper.find("#ok-settings").trigger("click");
        expect(wrapper.emitted("close")?.length).toBe(1);
        expect(mockSetParamSettings).toHaveBeenCalledTimes(1);
        expect(mockSetParamSettings.mock.calls[0][1]).toStrictEqual({
            parameterToVary: "A",
            scaleType: SensitivityScaleType.Logarithmic,
            variationType: SensitivityVariationType.Range,
            variationPercentage: 15,
            rangeFrom: 1,
            rangeTo: 3,
            numberOfRuns: 11
        });
    });
});