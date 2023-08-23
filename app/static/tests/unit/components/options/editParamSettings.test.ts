import Vuex from "vuex";
import {mount, VueWrapper} from "@vue/test-utils";
import {
    SensitivityParameterSettings,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import {mockBasicState, mockBatchParsDisplace, mockBatchParsRange, mockModelState, mockRunState} from "../../../mocks";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";
import {BasicState} from "../../../../src/app/store/basic/state";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";
import SensitivityParamValues from "../../../../src/app/components/options/SensitivityParamValues.vue";
import {expectCloseNumericArray} from "../../../testUtils";

//const mockTooltipDirective = jest.fn();

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

    const mockRunner = {
        batchParsDisplace: mockBatchParsDisplace,
        batchParsRange: mockBatchParsRange
    } as any;

    const parameterValues = { A: 1, B: 2 };

    const getWrapper = (settings: SensitivityParameterSettings) => {
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
                //directives: { tooltip: mockTooltipDirective }
            },
            props: {
                settings
            }
        });

        return wrapper;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when variation type is Percentage", () => {
        const wrapper = getWrapper(percentSettings);

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
        expect(wrapper.find("#param-central").exists()).toBe(false);
        expect(wrapper.find("#edit-to").exists()).toBe(false);

        expect(wrapper.find("#edit-runs label").text()).toBe("Number of runs");
        expect(wrapper.find("#edit-runs").findComponent(NumericInput).props("value")).toBe(5);

        expect(wrapper.find("#invalid-msg").exists()).toBe(false);
    });

    it("renders as expected when variation type is Range", () => {
        const wrapper = getWrapper(rangeSettings);

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

        expect(wrapper.find("#invalid-msg").exists()).toBe(false);
    });

    it("renders message when settings are invalid", async () => {
        const settings = { ...rangeSettings, rangeFrom: 10, rangeTo: 5 };
        const wrapper = getWrapper(settings);

        expect(wrapper.find("#invalid-msg").text())
            .toBe("Invalid settings: Mock error: min must be less than max");
    });

    const updateSelect = async (wrapper: VueWrapper<any>, rowId: string, newVal: string) => {
        const select = wrapper.find(`#${rowId} select`);
        (select.element as HTMLSelectElement).value = newVal;
        await select.trigger("change");
    };

    it("emits update when values changes", async () => {
        const wrapper = getWrapper(percentSettings);

        await updateSelect(wrapper, "edit-param-to-vary", "A");
        let expectedParams = {...percentSettings, parameterToVary: "A"};
        expect((wrapper.emitted() as any).update[0][0]).toStrictEqual(expectedParams);

        await updateSelect(wrapper, "edit-scale-type", SensitivityScaleType.Logarithmic);
        expectedParams = {...expectedParams, scaleType: SensitivityScaleType.Logarithmic};
        expect((wrapper.emitted() as any).update[1][0]).toStrictEqual(expectedParams);

        await wrapper.find("#edit-percent").findComponent(NumericInput).vm.$emit("update", 15);
        expectedParams = {...expectedParams, variationPercentage: 15};
        expect((wrapper.emitted() as any).update[2][0]).toStrictEqual(expectedParams);

        await updateSelect(wrapper, "edit-variation-type", SensitivityVariationType.Range);
        expectedParams = {...expectedParams, variationType: SensitivityVariationType.Range};
        expect((wrapper.emitted() as any).update[3][0]).toStrictEqual(expectedParams);

        await wrapper.find("#edit-from").findComponent(NumericInput).vm.$emit("update", 1);
        expectedParams = {...expectedParams, rangeFrom: 1};
        expect((wrapper.emitted() as any).update[4][0]).toStrictEqual(expectedParams);

        await wrapper.find("#edit-to").findComponent(NumericInput).vm.$emit("update", 3);
        expectedParams = {...expectedParams, rangeTo: 3};
        expect((wrapper.emitted() as any).update[5][0]).toStrictEqual(expectedParams);

        await wrapper.find("#edit-runs").findComponent(NumericInput).vm.$emit("update", 11);
        expectedParams = {...expectedParams, numberOfRuns: 11};
        expect((wrapper.emitted() as any).update[6][0]).toStrictEqual(expectedParams);
    });

    it("renders and updates sensitivity param values", async () => {
        const percentSpy = jest.spyOn(mockRunner, "batchParsDisplace");
        const rangeSpy = jest.spyOn(mockRunner, "batchParsRange");
        const wrapper = getWrapper(percentSettings);
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

    it("emits batchParsErrorChange", async () => {
        const wrapper = getWrapper(rangeSettings);
        await wrapper.find("#edit-to").findComponent(NumericInput).vm.$emit("update", 1);
        expect((wrapper.emitted() as any).batchParsErrorChange.length).toBe(1);
        expect((wrapper.emitted() as any).batchParsErrorChange[0][0]).toStrictEqual({errir: "to must be greater than from"});

        // emits with null when correct error
        await wrapper.find("#edit-to").findComponent(NumericInput).vm.$emit("update", 10);
        expect((wrapper.emitted() as any).batchParsErrorChange.length).toBe(2);
        expect((wrapper.emitted() as any).batchParsErrorChange[1][0]).toBe(null);
    });
});
