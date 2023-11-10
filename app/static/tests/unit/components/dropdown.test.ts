import { shallowMount } from "@vue/test-utils";
import DropDown from "../../../src/app/components/DropDown.vue";

describe("dropdown component", () => {
  const itemList = " <li><span class='dropdown-item' style='cursor: default;'>test</span></li>";

  const getWrapper = () => {
    return shallowMount(DropDown, {
      props: {
        text: "WODIN v1.2.3"
      },
      slots: {
        items: itemList
      }
    });
  };

  it("renders dropdown", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("a").attributes("href")).toBe("#");
    expect(wrapper.find("a").classes()).toEqual(["dropdown-toggle", "text-decoration-none"]);
    expect(wrapper.find("a").text()).toBe("WODIN v1.2.3");
  });

  it("renders dropdown items", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("ul").classes()).toEqual(["dropdown-menu", "dropdown-menu-end"]);
    const lists = wrapper.findAll("li");
    expect(lists.length).toBe(1);
    expect(lists.at(0)?.text()).toBe("test");
  });
});
