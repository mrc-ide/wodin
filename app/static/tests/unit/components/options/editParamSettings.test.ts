import Vuex from "vuex";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import {
    mockBasicState, mockBatchParsDisplace, mockBatchParsRange, mockModelState, mockRunState
} from "../../../mocks";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import SensitivityParamValues from "../../../../src/app/components/options/SensitivityParamValues.vue";
import { expectCloseNumericArray } from "../../../testUtils";
import TagInput from "../../../../src/app/components/options/TagInput.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";

const mockTooltipDirective = jest.fn();

describe("EditParamSettings", () => {
    const percentSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5,
        customValues: []
    };

    const rangeSettings = {
        parameterToVary: "A",
        scaleType: SensitivityScaleType.Logarithmic,
        variationType: SensitivityVariationType.Range,
        variationPercentage: 0,
        rangeFrom: 2,
        rangeTo: 6,
        numberOfRuns: 5,
        customValues: []
    };

    const customSettings = {
        parameterToVary: "C",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Custom,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5,
        customValues: [1, 2, 3]
    };

    const mockRunner = {
        batchParsDisplace: mockBatchParsDisplace,
        batchParsRange: mockBatchParsRange
    } as any;

    const parameterValues = { A: 1, B: 2, C: 3 };

    const getWrapper = async (paramSettings: SensitivityParameterSettings, open = true) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinRunnerOde: mockRunner
                    })
                },
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues
                    })
                }
            }
        });
        const wrapper = mount(EditParamSettings, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            },
            props: {
                open: false,
                paramSettings
            }
        });

        // We open after mounting to trigger the component to take an internal copy of store settings to edit
        if (open) {
            await wrapper.setProps({ open: true });
        }
        return wrapper;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

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
        expect(paramOptions.length).toBe(3);
        expect(paramOptions.at(0)!.text()).toBe("A");
        expect(paramOptions.at(1)!.text()).toBe("B");
        expect(paramOptions.at(2)!.text()).toBe("C");

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
        expect(varOptions.length).toBe(3);
        expect(varOptions.at(0)!.text()).toBe(SensitivityVariationType.Percentage);
        expect(varOptions.at(1)!.text()).toBe(SensitivityVariationType.Range);
        expect(varOptions.at(2)!.text()).toBe(SensitivityVariationType.Custom);

        expect(wrapper.find("#edit-percent label").text()).toBe("Variation (%)");
        expect(wrapper.find("#edit-percent").findComponent(NumericInput).props("value")).toBe(10);

        expect(wrapper.find("#edit-from").exists()).toBe(false);
        expect(wrapper.find("#param-central").exists()).toBe(false);
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
        expect(wrapper.find("#param-central").text()).toBe("Central value 1");
        expect(wrapper.find("#edit-to label").text()).toBe("To");
        expect(wrapper.find("#edit-to").findComponent(NumericInput).props("value")).toBe(6);

        expect(wrapper.find("#edit-runs").findComponent(NumericInput).props("value")).toBe(5);

        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).toBe(undefined);
        expect(wrapper.find("#invalid-msg").exists()).toBe(false);
    });

    it("renders as expected when variation type is Custom", async () => {
        const wrapper = await getWrapper(customSettings);
        const paramSelect = wrapper.find("#edit-param-to-vary select");
        expect((paramSelect.element as HTMLSelectElement).value).toBe("C");
        const varSelect = wrapper.find("#edit-variation-type select");
        expect((varSelect.element as HTMLSelectElement).value).toBe(SensitivityVariationType.Custom);
        const tagInput = wrapper.find("#edit-values").findComponent(TagInput);
        expect(tagInput.props().tags).toStrictEqual([1, 2, 3]);
        expect(tagInput.props().numericOnly).toBe(true);
        expect(wrapper.find("#edit-scale-type").exists()).toBe(false);
        expect(wrapper.find("#edit-percent").exists()).toBe(false);
        expect(wrapper.find("#edit-from").exists()).toBe(false);
        expect(wrapper.find("#edit-to").exists()).toBe(false);
        expect(wrapper.find("#edit-runs").exists()).toBe(false);
        expect(wrapper.findComponent(SensitivityParamValues).exists()).toBe(false);
    });

    it("disables OK and renders message when settings are invalid", async () => {
        const settings = { ...rangeSettings, rangeFrom: 10, rangeTo: 5 };
        const wrapper = await getWrapper(settings);

        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).not.toBe(undefined);
        expect(wrapper.find("#invalid-msg").text())
            .toBe("Invalid settings: Mock error: min must be less than max");
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

    it("emits update and closes on OK click", async () => {
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
        expect(wrapper.emitted("update")?.length).toBe(1);
        expect(wrapper.emitted("update")![0]).toStrictEqual([{
            parameterToVary: "A",
            scaleType: SensitivityScaleType.Logarithmic,
            variationType: SensitivityVariationType.Range,
            variationPercentage: 15,
            rangeFrom: 1,
            rangeTo: 3,
            numberOfRuns: 11,
            customValues: []
        }]);
    });

    it("renders and updates sensitivity param values", async () => {
        const percentSpy = jest.spyOn(mockRunner, "batchParsDisplace");
        const rangeSpy = jest.spyOn(mockRunner, "batchParsRange");
        const wrapper = await getWrapper(percentSettings);
        const sensitivityValues = wrapper.findComponent(SensitivityParamValues);
        expectCloseNumericArray(sensitivityValues.props("batchPars").values, [1.8, 1.9, 2, 2.1, 2.2]);
        expect(sensitivityValues.props("batchPars").name).toBe("B");
        expect(percentSpy).toHaveBeenCalledTimes(1);
        expect(percentSpy.mock.calls[0][0]).toStrictEqual(parameterValues);
        expect(percentSpy.mock.calls[0][1]).toBe("B");
        expect(percentSpy.mock.calls[0][2]).toBe(5);
        expect(percentSpy.mock.calls[0][3]).toBe(false);
        expect(percentSpy.mock.calls[0][4]).toBe(10);

        await updateSelect(wrapper, "edit-variation-type", SensitivityVariationType.Range);
        await wrapper.find("#edit-from").findComponent(NumericInput).vm.$emit("update", 1);
        await wrapper.find("#edit-to").findComponent(NumericInput).vm.$emit("update", 3);
        expectCloseNumericArray(sensitivityValues.props("batchPars").values, [1, 1.5, 2, 2.5, 3]);
        expect(rangeSpy).toHaveBeenCalledTimes(3); // called on each update
        expect(rangeSpy.mock.calls[2][0]).toStrictEqual(parameterValues);
        expect(rangeSpy.mock.calls[2][1]).toBe("B");
        expect(rangeSpy.mock.calls[2][2]).toBe(5);
        expect(rangeSpy.mock.calls[2][3]).toBe(false);
        expect(rangeSpy.mock.calls[2][4]).toBe(1);
        expect(rangeSpy.mock.calls[2][5]).toBe(3);
    });

    it("displays error when Custom variation type, and there are less than 2 values", async () => {
        const expectError = (wrapper: VueWrapper<any>) => {
            expect(wrapper.findComponent(ErrorInfo).props().error).toStrictEqual({
                error: "Invalid settings", detail: "Must include at least 2 traces in the batch"
            });
        };
        expectError(await getWrapper({ ...customSettings, customValues: [] }));
        expectError(await getWrapper({ ...customSettings, customValues: [1] }));

        const wrapper = await getWrapper({ ...customSettings, customValues: [1, 2] });
        expect(wrapper.findComponent(ErrorInfo).exists()).toBe(false);
    });

    it("updates values from TagInput, dedupes and sorts", async () => {
        const mockSetParamSettings = jest.fn();
        const wrapper = await getWrapper(customSettings, true, mockSetParamSettings);
        wrapper.findComponent(TagInput).vm.$emit("update", [5, 1, 5, 0, -1, -2, 1]);
        const expectedValues = [-2, -1, 0, 1, 5];
        await nextTick();
        expect((wrapper.vm as any).settingsInternal.customValues).toStrictEqual(expectedValues);
        await wrapper.find("#ok-settings").trigger("click");
        expect(mockSetParamSettings).toHaveBeenCalledTimes(1);
        const committed = mockSetParamSettings.mock.calls[0][1];
        expect(committed.customValues).toStrictEqual(expectedValues);
    });

    it("test set", () => {
        const cleaned = [...new Set([1, 2, 1])].sort();
        expect(cleaned).toStrictEqual([1, 2]);
    });
});
