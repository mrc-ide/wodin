import { shallowMount } from "@vue/test-utils";
import StandardFormInputVue from "../../../../src/app/components/options/StandardFormInput.vue";
import NumericInput from "../../../../src/app/components/options/NumericInput.vue";

describe("Standard Form Input", () => {
  const getWrapper = (placeholder: number[] | null = [3, 4]) => {
    if (placeholder !== null) {
      return shallowMount(StandardFormInputVue, {
        props: {
          value: [1, 2],
          placeholder
        }
      });
    }
    return shallowMount(StandardFormInputVue, {
      props: {
        value: [1, 2]
      }
    });
  };

  it("renders as expected", () => {
    const wrapper = getWrapper();
    const numericInputs = wrapper.findAllComponents(NumericInput);
    const spans = wrapper.findAll("span");
    expect(spans[0].attributes("style")).toBe("display: grid; grid-template-columns: 1.5fr 0.75fr 1fr;");
    expect(numericInputs[0].props("value")).toBe(1);
    expect(numericInputs[0].props("maxAllowed")).toBe(10);
    expect(numericInputs[0].props("minAllowed")).toBe(-10);
    expect(numericInputs[0].props("placeholder")).toBe(3);
    expect(spans[1].attributes("style")).toBe("display: flex; justify-content: center; align-items: center;");
    expect(spans[1].text()).toBe("x10^");
    expect(numericInputs[1].props("value")).toBe(2);
    expect(numericInputs[1].props("placeholder")).toBe(4);
  });

  it("first numeric input updates correct values in array", () => {
    const wrapper = getWrapper();
    const numericInputs = wrapper.findAllComponents(NumericInput);

    numericInputs[0].vm.$emit("update", 10);
    expect(wrapper.emitted("update")![0]).toStrictEqual([[10, 2]]);
  });

  it("second numeric input updates correct values in array", () => {
    const wrapper = getWrapper();
    const numericInputs = wrapper.findAllComponents(NumericInput);

    numericInputs[1].vm.$emit("update", 10);
    expect(wrapper.emitted("update")![0]).toStrictEqual([[1, 10]]);
  });

  it("defaults to empty placeholders if not provided", () => {
    const wrapper = getWrapper(null);
    const numericInputs = wrapper.findAllComponents(NumericInput);

    expect(numericInputs[0].props("placeholder")).toBe("");
    expect(numericInputs[1].props("placeholder")).toBe("");
  });
});
