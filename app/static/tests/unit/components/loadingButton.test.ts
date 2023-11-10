import { mount } from "@vue/test-utils";
import LoadingButton from "../../../src/app/components/LoadingButton.vue";

describe("LoadingButton", () => {
  const getWrapper = (loading = false, isDisabled = false) => {
    return mount(LoadingButton, {
      props: {
        loading,
        isDisabled
      },
      slots: {
        default: "Hey"
      }
    });
  };

  it("renders as expected", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("button").classes()).toContain("loading-btn");
    expect(wrapper.find("button").element.disabled).toBe(false);
    expect(wrapper.find("span").exists()).toBe(false);
    expect(wrapper.find("div").classes()).toStrictEqual([]);
    expect(wrapper.find("div").text()).toBe("Hey");
  });

  it("renders as expected when loading not isDisabled", () => {
    const wrapper = getWrapper(true);
    expect(wrapper.find("button").classes()).toContain("loading-btn");
    expect(wrapper.find("button").element.disabled).toBe(true);
    expect(wrapper.find("span").exists()).toBe(true);
    expect(wrapper.find("span").classes()).toStrictEqual(["spinner-border", "loading-spinner"]);
    expect(wrapper.find("div").classes()).toStrictEqual(["hidden-loading"]);
    expect(wrapper.find("div").text()).toBe("Hey");
  });

  it("renders as expected when isDisabled not loading", () => {
    const wrapper = getWrapper(false, true);
    expect(wrapper.find("button").classes()).toContain("loading-btn");
    expect(wrapper.find("button").element.disabled).toBe(true);
    expect(wrapper.find("span").exists()).toBe(false);
    expect(wrapper.find("div").classes()).toStrictEqual([]);
    expect(wrapper.find("div").text()).toBe("Hey");
  });

  it("renders as expected when isDisabled and loading", () => {
    const wrapper = getWrapper(true, true);
    expect(wrapper.find("button").classes()).toContain("loading-btn");
    expect(wrapper.find("button").element.disabled).toBe(true);
    expect(wrapper.find("span").exists()).toBe(true);
    expect(wrapper.find("span").classes()).toStrictEqual(["spinner-border", "loading-spinner"]);
    expect(wrapper.find("div").classes()).toStrictEqual(["hidden-loading"]);
    expect(wrapper.find("div").text()).toBe("Hey");
  });
});
