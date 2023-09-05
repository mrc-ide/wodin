import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";

type BoundTooltip = {
    number: number,
    variant?: "text" | "error"| "warning" | "success",
    message: string
}

const mockTooltipDirective = jest.fn();

describe("NumericInput", () => {
    const getWrapper = (
        value: number | null,
        maxAllowed: number | BoundTooltip[] = Infinity,
        minAllowed: number | BoundTooltip[] = -Infinity,
        placeholder: string | undefined = undefined
    ) => {
        return mount(NumericInput, {
            props: {
                value,
                maxAllowed,
                minAllowed,
                placeholder
            },
            global: {
                directives: { tooltip: mockTooltipDirective }
            }
        });
    };

    const expectInputToHaveValue = (wrapper: VueWrapper<any>, expectedTextValue: string) => {
        expect((wrapper.find("input").element as HTMLInputElement).value).toBe(expectedTextValue);
    };

    const expectInitialValueOnMount = async (value: number, expectedTextValue: string) => {
        const wrapper = getWrapper(value);
        expect(wrapper.find("input").attributes("type")).toBe("text");
        await nextTick();
        expectInputToHaveValue(wrapper, expectedTextValue);
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("renders as expected", async () => {
        await expectInitialValueOnMount(12, "12");
        await expectInitialValueOnMount(10000000, "10,000,000");
        await expectInitialValueOnMount(0.25, "0.25");
        await expectInitialValueOnMount(1234.5, "1,234.5");
        await expectInitialValueOnMount(-9999.9, "-9,999.9");
    });

    it("Updates and formats input when prop updates to externally changed value", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.setProps({ value: 9999 });
        expectInputToHaveValue(wrapper, "9,999");
    });

    it("Does not reformat input when prop updates to last numeric value set in component", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue("9999");

        await wrapper.setProps({ value: 9999 });

        expectInputToHaveValue(wrapper, "9999");
    });

    const expectEmitOnInputChange = async (newInputValue: string, expectedEmitValue: number) => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue(newInputValue);
        expect(wrapper.emitted("update")!.length).toBe(1);
        expect(wrapper.emitted("update")![0]).toStrictEqual([expectedEmitValue]);
        expectInputToHaveValue(wrapper, newInputValue);
    };

    const expectValueAndTooltip = async (
        wrapper: VueWrapper<any>,
        setVal: string,
        updateNum: number,
        expectVal: number,
        tooltipContent: string
    ) => {
        const { tooltipProps } = wrapper.vm as any;
        await wrapper.find("input").setValue(setVal);
        expect(wrapper.emitted("update")![updateNum]).toStrictEqual([expectVal]);
        expect(tooltipProps.content).toBe(tooltipContent);
    };

    it("emits new value on input change, and does not reformat", async () => {
        await expectEmitOnInputChange("9999", 9999);
        await expectEmitOnInputChange("0.1", 0.1);
        await expectEmitOnInputChange("-10", -10);
        // expect commas to be ignored
        await expectEmitOnInputChange("9,999", 9999);
        await expectEmitOnInputChange("1,00,00", 10000);
        await expectEmitOnInputChange(",10,.1", 10.1);
    });

    it("applies character mask", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue("100abc!");
        expectInputToHaveValue(wrapper, "100");
        expect(wrapper.emitted("update")![0]).toStrictEqual([100]);
    });

    it("masks out hyphen if it is in the middle of number", async () => {
        const wrapper = getWrapper(1);
        await wrapper.find("input").setValue("-10-0");
        expectInputToHaveValue(wrapper, "-100");
        expect(wrapper.emitted("update")![0]).toStrictEqual([-100]);
    });

    it("does not emit update if value is not parseable as numeric", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue("..1.2.3");
        expectInputToHaveValue(wrapper, "..1.2.3"); // only clears value on blur
        expect(wrapper.emitted("update")).toBe(undefined);
    });

    it("does max validation (number)", async () => {
        const wrapper = getWrapper(10, 10);
        await wrapper.find("input").setValue("11");
        expect(wrapper.emitted("update")![0]).toStrictEqual([10]);
        // mount and updated calls
        expect(mockTooltipDirective).toHaveBeenCalledTimes(2);
    });

    it("does max validation (array)", async () => {
        const wrapper = getWrapper(10, [
            { number: 12, message: "high tooltip" },
            { number: 10, message: "middle tooltip" }
        ]);
        await expectValueAndTooltip(wrapper, "11", 0, 11, "middle tooltip");
        await expectValueAndTooltip(wrapper, "13", 1, 12, "high tooltip");
    });

    it("does min validation (number)", async () => {
        const wrapper = getWrapper(1, 10, 2);
        await wrapper.find("input").setValue("1");
        expect(wrapper.emitted("update")![0]).toStrictEqual([2]);
        expect(mockTooltipDirective).toHaveBeenCalledTimes(2);
    });

    it("does min validation (array)", async () => {
        const wrapper = getWrapper(12, Infinity, [
            { number: 12, message: "middle tooltip" },
            { number: 10, message: "low tooltip" }
        ]);
        await expectValueAndTooltip(wrapper, "11", 0, 11, "middle tooltip");
        await expectValueAndTooltip(wrapper, "9", 1, 10, "low tooltip");
    });

    it("does max validation (array) with sorting", async () => {
        const wrapper = getWrapper(12, [
            { number: 10, message: "10 tooltip" },
            { number: 12, message: "12 tooltip" },
            { number: 13, message: "13 tooltip" },
            { number: 13, message: "13 tooltip" },
            { number: 10, message: "10 tooltip" }
        ]);
        await expectValueAndTooltip(wrapper, "9", 0, 9, "");
        await expectValueAndTooltip(wrapper, "11", 1, 11, "10 tooltip");
        await expectValueAndTooltip(wrapper, "13", 2, 13, "12 tooltip");
        await expectValueAndTooltip(wrapper, "14", 3, 13, "13 tooltip");
    });

    it("sets tooltip content to empty if above all mins (array)", async () => {
        const wrapper = getWrapper(12, Infinity, [
            { number: 10, message: "10 tooltip" },
            { number: 12, message: "12 tooltip" },
            { number: 13, message: "13 tooltip" },
            { number: 13, message: "13 tooltip" },
            { number: 10, message: "10 tooltip" }
        ]);
        await expectValueAndTooltip(wrapper, "13", 0, 13, "");
    });

    it("formats input value on blur", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue("9999.9");
        await wrapper.setProps({ value: 9999.9 });

        await wrapper.find("input").trigger("blur");

        expectInputToHaveValue(wrapper, "9,999.9");
    });

    it("renders as expected if value set to null", async () => {
        const wrapper = getWrapper(10, Infinity, -Infinity, "test placeholder");
        await nextTick();

        const input = wrapper.find("input");
        await wrapper.setProps({ value: null });
        await input.setValue(null);

        expect(input.attributes("placeholder")).toBe("test placeholder");
        await input.trigger("blur");

        expect((wrapper.vm as any).textValue).toBe("");
    });
});
