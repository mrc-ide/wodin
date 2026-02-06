import { VueWrapper } from "@vue/test-utils";
import WodinPanels from "../src/components/WodinPanels.vue";

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

// utility type that removes generic type nesting in typescript LSP
// preview and shows the type as an actual object
// see https://gist.github.com/palashmon/db68706d4f26d2dbf187e76409905399
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

// makes the field optional if it can be undefined and removes
// fields that can't be undefined (notice ? after foo)
//
// { foo: string | undefined, bar: number } -> { foo?: string | undefined }
type OptionalKeys<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

// extracts the fields that cannot undefined
//
// { foo: string | undefined, bar: number } -> { bar: number }
type RequiredKeys<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

// the OptionalKeys and RequiredKeys are needed because vue now types
// the props defined as
// {
//     foo: { type: String, required: true },
//     bar: { type: String, required: false },
// }
//
// as
//
// { foo: string, bar: string | undefined }
//
// but it should be
//
// { foo: string, bar?: string | undefined }
export type ComponentProps<T> =
    T extends { setup?: (props: infer Props, ...otherArgs: any[]) => any }
        ? Prettify<RequiredKeys<Props> & OptionalKeys<Props>>
        : never
