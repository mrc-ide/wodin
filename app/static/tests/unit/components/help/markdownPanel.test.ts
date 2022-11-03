// Mock imports of third party packages so we can mock their methods before importing component

const mockMarkdownItMathjax = jest.fn();
jest.mock("markdown-it-mathjax", () => ({ __esModule: true, default: () => { return "test"; } }));
class MockClass {}
jest.mock("markdown-it", () => MockClass);

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import MarkdownPanel from "../../../../src/app/components/help/MarkdownPanel.vue";

describe("MarkdownPanel", () => {
    const getWrapper = (markdown: string[]) => {
        return shallowMount(MarkdownPanel, {
            props: {
                markdown
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper([]);
    });
});
