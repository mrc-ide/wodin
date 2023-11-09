import { VueWrapper } from "@vue/test-utils";
import WodinPanels from "../src/app/components/WodinPanels.vue";
import {ref} from "vue";
import * as downloadPlot from "../src/app/components/mixins/downloadPlot";

export const fileTimeout = 20;

export const expectCloseNumericArray = (actual: number[], expected: number[]) => {
    expect(actual.length).toBe(expected.length);
    actual.forEach((value, idx) => {
        expect(value).toBeCloseTo(expected[idx]);
    });
};

const expectWodinTabs = (wrapper: VueWrapper<any>, expectedTabNames: string[], tabType: string) => {
    const wodinPanels = wrapper.findComponent(WodinPanels);
    const panel = wodinPanels.find(`.wodin-${tabType}`);
    const tabs = panel.find(`#${tabType}-tabs`);
    const links = tabs.findAll("ul li a");

    expect(links.length).toBe(expectedTabNames.length);
    expectedTabNames.forEach((expected: string, idx: number) => {
        expect(links[idx]!.text()).toBe(expected);
    });
};

export const expectRightWodinTabs = (wrapper: VueWrapper<any>, expectedTabNames: string[]) => {
    expectWodinTabs(wrapper, expectedTabNames, "right");
};

export const expectLeftWodinTabs = (wrapper: VueWrapper<any>, expectedTabNames: string[]) => {
    expectWodinTabs(wrapper, expectedTabNames, "left");
};

export const mockDownloadImageResult = {
    showDownloadImageModal: ref(true),
    downloadImageProps: { title: "test title", xLabel: "test x", yLabel: "test y" },
    closeModal: jest.fn(),
    downloadImage: jest.fn()
} as any;

export const mockDownloadPlotMixin = jest.spyOn(downloadPlot, "default").mockImplementation(() => mockDownloadImageResult);

