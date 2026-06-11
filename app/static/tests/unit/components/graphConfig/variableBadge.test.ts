import Vuex from "vuex";
import VariableBadge from "@/components/graphConfig/VariableBadge.vue";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "@/store/basic/state";

describe("Variable Badge", () => {
  const getWrapper = (inHidden = false) => {
    const store = new Vuex.Store<BasicState>({
      state: {} as any,
      modules: {
        model: {
          namespaced: true,
          state: {
            paletteModel: {
              I: "yellow",
              R: "red",
            }
          }
        }
      }
    });

    return shallowMount(VariableBadge, {
      props: {
        variable: "I",
        inHidden,
      },
      global: {
        plugins: [store]
      }
    });
  };

  test("renders as expected when not hidden", () => {
    const wrapper = getWrapper();
    expect(wrapper.find(".badge").element.getAttribute("style")).toContain("yellow");
    expect(wrapper.find(".variable-name").text()).toBe("I");
    expect(wrapper.find(".variable-delete").exists()).toBe(true);
  });

  test("renders as expected when hidden", () => {
    const wrapper = getWrapper(true);
    // be another faded color, not yellow or red
    expect(wrapper.find(".badge").element.getAttribute("style")).not.toContain("yellow");
    expect(wrapper.find(".badge").element.getAttribute("style")).not.toContain("red");
    expect(wrapper.find(".variable-name").text()).toBe("I");
    expect(wrapper.find(".variable-delete").exists()).toBe(false);
  });

  test("emits drag start and end events", async () => {
    const wrapper = getWrapper();
    await wrapper.find(".badge").trigger("dragstart");
    expect(wrapper.emitted("dragstart")![0][0]).toBeTruthy();

    await wrapper.find(".badge").trigger("dragend");
    expect(wrapper.emitted("dragend")![0][0]).toBeTruthy();
  });

  test("remove variable emits variable", async () => {
    const wrapper = getWrapper();
    await wrapper.find(".variable-delete").find("button").trigger("click");
    expect(wrapper.emitted("removeVariable")![0][0]).toBe("I");
  });
});
