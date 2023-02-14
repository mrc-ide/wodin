import { mount } from "@vue/test-utils";
import { Tooltip } from "bootstrap";
import tooltip from "../../../src/app/directives/tooltip";
import { nextTick, ref } from 'vue';

describe("tooltip directive", () => {
    const mountTemplate = (props: object | string = 'hello',
    isUpdate: boolean = false,
    endContent: string | object = 'hey',
    startContent: string | object = 'hello') => {
        const testComponent = {
            template: isUpdate ? 
            `<template>
                <div v-tooltip="updateProps" :value="value" @click="handleClick"></div>
            </template>` : 
            `<template>
                <div v-tooltip="props"></div>
            </template>`,
            data() {
                var updateProps = ref(startContent);
                const value = ref(0);
                const handleClick = () => {
                    updateProps.value = endContent
                    value.value += 1
                };
                return {
                    props,
                    value,
                    handleClick,
                    updateProps
                }
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
        const tooltip = Tooltip.getInstance(div.element) as any;

        // checking tooltip props directly
        expect(tooltip._config.placement).toBe("top");
        expect(tooltip._config.title).toBe("hello");
        expect(tooltip._config.toggle).toBe("tooltip");
        expect(tooltip._config.customClass).toBe("");
    });

    it("adds expected attributes with variants and placement", async () => {
        const wrapper = mountTemplate({
            content: 'hello',
            placement: 'right',
            variant: 'warning'
        });
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;

        expect(tooltip._config.placement).toBe("right");
        expect(tooltip._config.title).toBe("hello");
        expect(tooltip._config.toggle).toBe("tooltip");
        expect(tooltip._config.customClass).toBe("tooltip-warning");
    });
    
    it("updates title (string) when component is updated", async () => {
        const wrapper = mountTemplate('hello', true);
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        expect(tooltip._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("hey");
    });

    it("updates title (object) when component is updated", async () => {
        const wrapper = mountTemplate('hello',
        true,
        { content: 'hey' },
        { content: 'hello' });
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        expect(tooltip._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("hey");
    });

    it("does not have title if no content after update", async () => {
        const wrapper = mountTemplate('hello',
        true,
        { content: '' },
        { content: 'hello' });
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;
        expect(tooltip._config.title).toBe("hello");
        await div.trigger("click");
        const divClick = wrapper.find("div");
        const tooltipClick = Tooltip.getInstance(divClick.element) as any;
        expect(tooltipClick._config.title).toBe("");
    });

    it("adds default attributes in object form props", async () => {
        const wrapper = mountTemplate({
            content: '',
        });
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;

        expect(tooltip._config.placement).toBe("top");
        expect(tooltip._config.title).toBe("");
        expect(tooltip._config.toggle).toBe("tooltip");
        expect(tooltip._config.customClass).toBe("");
    });

    it("does not show if no content provided", async () => {
        const wrapper = mountTemplate("");
        const div = wrapper.find("div");
        const tooltip = Tooltip.getInstance(div.element) as any;

        expect(tooltip._config.placement).toBe("top");
        expect(tooltip._config.title).toBe("");
        expect(tooltip._config.toggle).toBe("tooltip");
        expect(tooltip._config.customClass).toBe("");
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
