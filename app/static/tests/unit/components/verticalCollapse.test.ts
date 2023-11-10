import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import VerticalCollapse from "../../../src/app/components/VerticalCollapse.vue";

describe("VerticalCollapse", () => {
  const getWrapper = (collapsedDefault = false) => {
    return shallowMount(VerticalCollapse, {
      slots: {
        default: "<h1>TEST SLOT CONTENT</h1>"
      },
      props: {
        title: "Test Title",
        collapseId: "test-collapse-id",
        collapsedDefault
      }
    });
  };

  it("renders as expected", () => {
    const wrapper = getWrapper();
    expect(wrapper.find(".collapse-title").text()).toBe("Test Title");
    const collapse = wrapper.find("a");
    expect(collapse.attributes("data-bs-toggle")).toBe("collapse");
    expect(collapse.attributes("href")).toBe("#test-collapse-id");
    expect(collapse.attributes("role")).toBe("button");
    expect(collapse.attributes("aria-expanded")).toBe("true");
    expect(collapse.attributes("aria-controls")).toBe("test-collapse-id");
    expect(collapse.findComponent(VueFeather).props("type")).toBe("chevron-up");
    expect(wrapper.find("div.collapse").classes()).toContain("show");
  });

  it("toggles icon on collapse/expand", async () => {
    const wrapper = getWrapper();
    const collapse = wrapper.find("a");
    await collapse.trigger("click");
    expect(collapse.findComponent(VueFeather).props("type")).toBe("chevron-down");
    await collapse.trigger("click");
    expect(collapse.findComponent(VueFeather).props("type")).toBe("chevron-up");
  });

  it("initially renders as collapsed if prop set to true", () => {
    const wrapper = getWrapper(true);
    expect(wrapper.find("div.collapse").classes()).toStrictEqual(["collapse"]);
  });
});
