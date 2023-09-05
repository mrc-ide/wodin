import { ref } from "vue";
import { mount } from "@vue/test-utils";
import { Tooltip } from "bootstrap";
import tooltip from "../../../src/app/directives/tooltip";

const expectTooltipConfig = (
    el: HTMLElement,
    title: string,
    placement: bootstrap.Tooltip.PopoverPlacement,
    trigger: bootstrap.Tooltip.Options["trigger"],
    customClass: string,
    delayMs: number
) => {
    expect((Tooltip.getInstance(el) as any)._config.title).toBe(title);
    expect((Tooltip.getInstance(el) as any)._config.placement).toBe(placement);
    expect((Tooltip.getInstance(el) as any)._config.trigger).toBe(trigger);
    expect((Tooltip.getInstance(el) as any)._config.toggle).toBe("tooltip");
    expect((Tooltip.getInstance(el) as any)._config.customClass).toBe(customClass);
    expect((Tooltip.getInstance(el) as any)._config.delay).toStrictEqual({ show: delayMs, hide: 0 });
};

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
        expectTooltipConfig(div.element, "hello", "top", "hover", "", 0);
    });

    it("adds expected attributes (object)", async () => {
        const wrapper = mountTemplate({ trigger: "manual" });
        const div = wrapper.find("div");

        // checking tooltip props directly
        expectTooltipConfig(div.element, "", "top", "manual", "", 0);
    });

    it("adds expected attributes with variants and placement", async () => {
        const wrapper = mountTemplate({
            content: "hello",
            placement: "right",
            variant: "warning",
            trigger: "click",
            delayMs: 50
        });
        const div = wrapper.find("div");
        expectTooltipConfig(div.element, "hello", "right", "click", "tooltip-warning", 50);
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

    it("disposes and creates new tooltip when variant is changed", async () => {
        const wrapper = mountTemplate("hello",
            true,
            { content: "hey", variant: "warning" },
            { content: "hey", variant: "success" });
        const div = wrapper.find("div");
        const tooltipInstance = Tooltip.getInstance(div.element) as any;
        expect(tooltipInstance._config.title).toBe("hey");
        expect(tooltipInstance._config.customClass).toBe("tooltip-success");
        const spyDispose = jest.spyOn(tooltipInstance, "dispose");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(spyDispose).toBeCalledTimes(1);
        expect(tooltipClick._config.title).toBe("hey");
        expect(tooltipClick._config.customClass).toBe("tooltip-warning");
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
        expectTooltipConfig(div.element, "", "top", "hover", "", 0);
    });

    it("does not show if no content provided", async () => {
        const wrapper = mountTemplate("");
        const div = wrapper.find("div");
        expectTooltipConfig(div.element, "", "top", "hover", "", 0);
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

    it("does not update tooltip if already null", async () => {
        const wrapper = mountTemplate("", true, {
            content: "",
            trigger: "manual"
        }, {
            content: "hey",
            trigger: "manual"
        });
        const div = wrapper.find("div");
        const el = div.element;
        const tooltipInstance = Tooltip.getInstance(el)!;
        const spyDispose = jest.spyOn(tooltipInstance, "dispose");
        const spyHide = jest.spyOn(tooltipInstance, "hide");
        const spyShow = jest.spyOn(tooltipInstance, "show");
        tooltipInstance.dispose();
        await div.trigger("click");
        // my dispose above rather than disposing when unmount
        expect(spyDispose).toHaveBeenCalledTimes(1);
        expect(spyHide).toHaveBeenCalledTimes(0);
        expect(spyShow).toHaveBeenCalledTimes(0);
    });

    it("hides if no content", async () => {
        const wrapper = mountTemplate("", true, {
            content: "",
            trigger: "manual"
        }, {
            content: "hey",
            trigger: "manual"
        });
        const div = wrapper.find("div");
        const spyHide = jest.spyOn((Tooltip.getInstance(div.element) as any), "hide");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("hey");
        await div.trigger("click");
        expect(spyHide).toHaveBeenCalled();
        const divClick = wrapper.find("div");
        expect((Tooltip.getInstance(divClick.element) as any)._config.title).toBe("");
    });

    it("shows if content", async () => {
        const wrapper = mountTemplate("", true, {
            content: "hey",
            trigger: "manual"
        }, {
            content: "",
            trigger: "manual"
        });
        const div = wrapper.find("div");
        const spyShow = jest.spyOn((Tooltip.getInstance(div.element) as any), "show");
        expect((Tooltip.getInstance(div.element) as any)._config.title).toBe("");
        await div.trigger("click");
        expect(spyShow).toHaveBeenCalled();
        const divClick = wrapper.find("div");
        expect((Tooltip.getInstance(divClick.element) as any)._config.title).toBe("hey");
    });
});
