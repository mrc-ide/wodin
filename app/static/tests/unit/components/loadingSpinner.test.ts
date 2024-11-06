import { mount } from "@vue/test-utils";
import LoadingSpinner from "../../../src/components/LoadingSpinner.vue";

describe("LoadingSpinner", () => {
    it("renders as expected", () => {
        const wrapper = mount(LoadingSpinner);
        expect(wrapper.find("span").classes()).toStrictEqual(["spinner-border"]);
        expect(wrapper.find("span").attributes("style")).toBe(
            "height: 200px; width: 200px; border-width: 25px; color: rgb(13, 110, 253);"
        );
    });

    it("sets svg size as expected", () => {
        const defaultSize = mount(LoadingSpinner);
        expect(defaultSize.find("span").attributes("style")).toBe(
            "height: 200px; width: 200px; border-width: 25px; color: rgb(13, 110, 253);"
        );

        const xs = mount(LoadingSpinner, { propsData: { size: "xs" } });
        expect(xs.find("span").attributes("style")).toBe(
            "height: 40px; width: 40px; border-width: 6px; color: rgb(13, 110, 253);"
        );

        const sm = mount(LoadingSpinner, { propsData: { size: "sm" } });
        expect(sm.find("span").attributes("style")).toBe(
            "height: 100px; width: 100px; border-width: 20px; color: rgb(13, 110, 253);"
        );
    });
});
