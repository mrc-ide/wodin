import { nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { Tooltip } from "bootstrap";
import tooltip from "../../../src/app/directives/tooltip";

describe("tooltip directive", () => {
    const mountTemplate = (props: Record<string, unknown> | string = "hello",
        isUpdate = false,
        endContent: string | Record<string, unknown> = "hey",
        startContent: string | Record<string, unknown> = "hello") => {
        const testComponent = {
            template: isUpdate
                ? `<template>
                    <div v-tooltip="updateProps" :value="value" @click="handleClick"></div>
                </template>`
                : `<template>
                    <div v-tooltip="props"></div>
                </template>`,
            data() {
                const updateProps = ref(startContent);
                const value = ref(0);
                const handleClick = () => {
                    updateProps.value = endContent;
                    value.value += 1;
                };
                return {
                    props,
                    value,
                    handleClick,
                    updateProps
                };
            }
        };
        return mount(testComponent, {
            global: {
                directives: { tooltip }
            }
        });
    };

    it("adds expected attributes", async () => {
        const wrapper = mountTemplate();
        const div = wrapper.find("div");

        // checking tooltip props directly
        expect((Tooltip.getInstance(div.element) as any)._config.placement).toBe("top");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hello");
        expect((Tooltip.getInstance(div.element) as any)._config.toggle).toBe("tooltip");
        expect((Tooltip.getInstance(div.element) as any)._config.customClass).toBe("");
    });

    it("adds expected attributes with variants and placement", async () => {
        const wrapper = mountTemplate({
            content: "hello",
            placement: "right",
            variant: "warning"
        });
        const div = wrapper.find("div");

        expect((Tooltip.getInstance(div.element) as any)._config.placement).toBe("right");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hello");
        expect((Tooltip.getInstance(div.element) as any)._config.toggle).toBe("tooltip");
        expect((Tooltip.getInstance(div.element) as any)._config.customClass).toBe("tooltip-warning");
    });

    it("updates title (string) when component is updated", async () => {
        const wrapper = mountTemplate("hello", true);
        const div = wrapper.find("div");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("hey");
    });

    it("updates title (object) when component is updated", async () => {
        const wrapper = mountTemplate("hello",
            true,
            { content: "hey" },
            { content: "hello" });
        const div = wrapper.find("div");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("hey");
    });

    it("does not have title if no content after update", async () => {
        const wrapper = mountTemplate("hello",
            true,
            { content: "" },
            { content: "hello" });
        const div = wrapper.find("div");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("");
    });

    it("adds default attributes in object form props", async () => {
        const wrapper = mountTemplate({
            content: ""
        });
        const div = wrapper.find("div");

        expect((Tooltip.getInstance(div.element) as any)._config.placement).toBe("top");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("");
        expect((Tooltip.getInstance(div.element) as any)._config.toggle).toBe("tooltip");
        expect((Tooltip.getInstance(div.element) as any)._config.customClass).toBe("");
    });

    it("does not show if no content provided", async () => {
        const wrapper = mountTemplate("");
        const div = wrapper.find("div");

        expect((Tooltip.getInstance(div.element) as any)._config.placement).toBe("top");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("");
        expect((Tooltip.getInstance(div.element) as any)._config.toggle).toBe("tooltip");
        expect((Tooltip.getInstance(div.element) as any)._config.customClass).toBe("");
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
