import { nextTick, ref } from "vue";
import { mount, shallowMount } from "@vue/test-utils";
import { Tooltip } from "bootstrap";
import tooltipControlled from "../../../src/app/directives/tooltip-controlled";

describe("tooltip directive", () => {
    const mountTemplate = (startContent = "hey", endContent = "hello", variant = "") => {
        const testComponent = {
            template: `<template>
                <div v-tooltip-controlled="tooltipProps" :value="value" @click="handleClick"/>
            </template>`,
            data() {
                const tooltipProps = {
                    content: startContent,
                    placement: null,
                    variant
                };
                const value = ref(0);
                const handleClick = () => {
                    tooltipProps.content = endContent;
                    value.value += 1;
                };
                return {
                    tooltipProps,
                    value,
                    handleClick
                };
            }
        };
        return mount(testComponent, {
            global: {
                directives: { "tooltip-controlled": tooltipControlled }
            }
        });
    };

    it("works and changes title after update", async () => {
        const wrapper = mountTemplate();
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;

        // checking tooltip props directly
        await expect(tooltip._config.placement).toBe("top");
        await expect(tooltip._config.toggle).toBe("tooltip");
        await expect(tooltip._config.customClass).toBe("");
        await expect(tooltip._config.title).toBe("hey");
        await div.trigger("click");
        await expect(tooltip._config.title).toBe("hello");
    });

    it("variant works", async () => {
        const wrapper = mountTemplate("hey", "hello", "error");
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        await expect(tooltip._config.customClass).toBe("tooltip-error");
    });

    it("disposes if no content", async () => {
        const wrapper = mountTemplate("hey", "");
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        const spyHide = jest.spyOn(tooltip, "hide");
        await expect(tooltip._config.title).toBe("hey");
        await div.trigger("click");
        expect(spyHide).toHaveBeenCalled();
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        await expect(tooltipClick._config.title).toBe("");
    });

    it("shows if content", async () => {
        const wrapper = mountTemplate("", "hey");
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        const spyShow = jest.spyOn(tooltip, "show");
        await expect(tooltip._config.title).toBe("");
        await div.trigger("click");
        expect(spyShow).toHaveBeenCalled();
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        await expect(tooltipClick._config.title).toBe("hey");
    });

    it("update does not occur if tooltip is null", async () => {
        const wrapper = mountTemplate("hey", "");
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        const spyHide = jest.spyOn(tooltip, "show");
        tooltip.dispose();
        await div.trigger("click");
        expect(spyHide).not.toHaveBeenCalled();
    });

    it("disposes of tooltip on unmount", () => {
        const wrapper = mountTemplate();
        const el = wrapper.find("div").element;
        const tooltipInstance = Tooltip.getInstance(el)!;
        const spyDispose = jest.spyOn(tooltipInstance, "dispose");
        wrapper.unmount();
        expect(spyDispose).toHaveBeenCalled();
    });

    it("does not dispose of tooltip on unmount if already null", () => {
        const wrapper = mountTemplate();
        const el = wrapper.find("div").element;
        const tooltipInstance = Tooltip.getInstance(el)!;
        const spyDispose = jest.spyOn(tooltipInstance, "dispose");
        tooltipInstance.dispose();
        wrapper.unmount();
        // my dispose above rather than disposing when unmount
        expect(spyDispose).toHaveBeenCalledTimes(1);
    });
});
