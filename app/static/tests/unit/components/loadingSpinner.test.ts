import { mount } from "@vue/test-utils";
import LoadingSpinner from "../../../src/app/components/LoadingSpinner.vue";

describe("LoadingSpinner", () => {
    it("sets svg size as expected", () => {
        const defaultSize = mount(LoadingSpinner);
        expect(defaultSize.find("svg").attributes("height")).toBe("200px");
        expect(defaultSize.find("svg").attributes("width")).toBe("200px");

        const xs = mount(LoadingSpinner, { propsData: { size: "xs" } });
        expect(xs.find("svg").attributes("height")).toBe("40px");
        expect(xs.find("svg").attributes("width")).toBe("40px");

        const sm = mount(LoadingSpinner, { propsData: { size: "sm" } });
        expect(sm.find("svg").attributes("height")).toBe("100px");
        expect(sm.find("svg").attributes("width")).toBe("100px");
    });

    it("renders as expected", () => {
        const wrapper = mount(LoadingSpinner);
        expect(wrapper.findAll("circle animate").length).toBe(8);
        expect(wrapper.findAll("circle animateTransform").length).toBe(8);
    });
});
