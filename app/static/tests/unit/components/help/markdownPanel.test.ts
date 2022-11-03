// Mock imports of third party packages so we can mock their methods before importing component

const mockMarkdownItMathjax = jest.fn();
jest.mock("markdown-it-mathjax", () => ({ __esModule: true, default: () => { return "test"; } }));
//class MockClass {}
jest.mock("../../../../src/app/components/help/MarkdownItImport.ts", () => {
    // mock constructor - this cannot be an arrow function, see
    // https://stackoverflow.com/questions/47402005
    return function(){
        return {test: "seomthing"}
    }
});

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import MarkdownPanel from "../../../../src/app/components/help/MarkdownPanel.vue";

describe("MarkdownPanel", () => {
    const getWrapper = (markdown: string[]) => {
        return shallowMount(MarkdownPanel as any, {
            props: {
                markdown
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("initialises as expected", () => {
        const wrapper = getWrapper([]);
    });
});
