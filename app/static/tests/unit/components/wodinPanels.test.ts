import {shallowMount, VueWrapper} from "@vue/test-utils";
import WodinPanels from "../../../src/app/components/WodinPanels.vue";

describe("WodinPaneks", () => {

    const getWrapper = () => {
        return shallowMount(WodinPanels, {
            slots: {
                left: `<div id="l-slot-content">LEFT</div>`,
                right: `<div id="r-slot-content">RIGHT</div>`
            }
        });
    };

    const testBothMode = (wrapper: VueWrapper) => {
        const containerDiv = wrapper.find("div.wodin-mode-both");
        expect(containerDiv.exists()).toBe(true);

        expect(containerDiv.find("#collapse-left").exists()).toBe(true);
        expect(containerDiv.find("#collapse-right").exists()).toBe(true);
    };

    const testRightMode = (wrapper: VueWrapper) => {
        const containerDiv = wrapper.find("div.wodin-mode-right");
        expect(containerDiv.exists()).toBe(true);

        expect(containerDiv.find("#collapse-left").exists()).toBe(false);
        expect(containerDiv.find("#collapse-right").exists()).toBe(true);
    };

    const testLeftMode = (wrapper: VueWrapper) => {
        const containerDiv = wrapper.find("div.wodin-mode-left");
        expect(containerDiv.exists()).toBe(true);

        expect(containerDiv.find("#collapse-left").exists()).toBe(true);
        expect(containerDiv.find("#collapse-right").exists()).toBe(false);
    };

    it("has expected slot content", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#wodin-content-left").html()).toContain(`<div id="l-slot-content">LEFT</div>`);
        expect(wrapper.find("#wodin-content-right").html()).toContain(`<div id="r-slot-content">RIGHT</div>`);
    });

    it("defaults to Both mode", () => {
        const wrapper = getWrapper();
        testBothMode(wrapper);
    });

    it("clicking left then right buttons switches mode as expected", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#collapse-left").trigger("click");
        testRightMode(wrapper);
        await wrapper.find("#collapse-right").trigger("click");
        testBothMode(wrapper);
    });

    it("clicking right then left buttons switches mode as expected", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#collapse-right").trigger("click");
        testLeftMode(wrapper);
        await wrapper.find("#collapse-left").trigger("click");
        testBothMode(wrapper);
    });

    it("clicking on 'View Options' switches mode as expected", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#collapse-left").trigger("click");
        await wrapper.find(".view-left").trigger("click");
        testBothMode(wrapper);
    });

    it("clicking on 'View Charts' switches mode as expected", async () => {
        const wrapper = getWrapper();
        await wrapper.find("#collapse-right").trigger("click");
        await wrapper.find(".view-right").trigger("click");
        testBothMode(wrapper);
    });
});
