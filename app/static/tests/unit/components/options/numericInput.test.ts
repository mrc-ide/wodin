import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";

const mockTooltipDirective = jest.fn();

describe("NumericInput", () => {
    const getWrapper = (value: number, maxAllowed = Infinity, minAllowed = -Infinity) => {
        return mount(NumericInput, {
            props: {
                value,
                maxAllowed,
                minAllowed
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

    it("does max validation", async () => {
        const wrapper = getWrapper(10, 10);
        await wrapper.find("input").setValue("11");
        expect(wrapper.emitted("update")![0]).toStrictEqual([10]);
        // mount and updated calls
        expect(mockTooltipDirective).toHaveBeenCalledTimes(2);
    });

    it("does min validation", async () => {
        const wrapper = getWrapper(1, 10, 2);
        await wrapper.find("input").setValue("1");
        expect(wrapper.emitted("update")![0]).toStrictEqual([2]);
        expect(mockTooltipDirective).toHaveBeenCalledTimes(2);
    });

    it("formats input value on blur", async () => {
        const wrapper = getWrapper(12);
        await nextTick();

        await wrapper.find("input").setValue("9999.9");
        await wrapper.setProps({ value: 9999.9 });

        await wrapper.find("input").trigger("blur");

        expectInputToHaveValue(wrapper, "9,999.9");
    });
});
