import { mount } from "@vue/test-utils";
import {Tooltip} from "bootstrap";
import tooltip from "../../../src/app/directives/tooltip";

describe("tooltip directive", () => {
    const mountTemplate = () => {
        const testComponent = {
            template: `<template><div v-tooltip="'hello'"></div></template>`
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

        // The custom directive sets "title" attribute, which bootstrap converts to data-bs-original-title and
        // aria-label via the Tooltip object
        expect(div.attributes("data-bs-original-title")).toBe("hello");
        expect(div.attributes("aria-label")).toBe("hello");
        expect(div.attributes("data-bs-toggle")).toBe("tooltip");
    });

    it("disposes of tooltip on unmount", () => {
        const wrapper = mountTemplate();
        const el = wrapper.find("div").element;
        const tooltipInstance = Tooltip.getInstance(el)!;
        const spyDispose = jest.spyOn(tooltipInstance, "dispose");
        wrapper.unmount();
        expect(spyDispose).toHaveBeenCalled();
    });
});
