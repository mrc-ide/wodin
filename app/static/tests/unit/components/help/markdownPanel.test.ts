// Mock imports of third party packages so we can mock their methods before importing component
const mockMarkdownItMathjaxPlugin = {};
const mockRenderOutput = "<span>mockRenderOutput</span>";
const mockRender = vi.fn().mockReturnValue(mockRenderOutput);
const mockMarkdownIt = {
    renderer: {
        rules: {
            // image prop will be set by component
        }
    },
    render: mockRender
} as any;
const mockMarkdownItUse = vi.fn().mockReturnValue(mockMarkdownIt);
vi.mock("markdown-it-mathjax", () => ({ __esModule: true, default: () => mockMarkdownItMathjaxPlugin }));

vi.mock("../../../../src/components/help/MarkdownItImport.ts", () => {
  class MarkDownItClass {
      constructor() {
          return {
              use: mockMarkdownItUse
          }
      }
  };
  return {
      default: {
          default: MarkDownItClass
      }
  }
});

import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import MarkdownPanel from "../../../../src/components/help/MarkdownPanel.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState } from "../../../mocks";

describe("MarkdownPanel", () => {
    const getWrapper = (markdown: string[]) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ baseUrl: "http://localhost:3000" })
        });
        return shallowMount(MarkdownPanel as any, {
            props: {
                markdown
            },
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const testImageRewriteRule = (rule: Function, imgSrc: string, expectedOutputSrc: string) => {
        const tokens = [
            {
                attrIndex: () => 0,
                attrs: [["src", imgSrc]]
            }
        ];
        const idx = 0;
        const mockRenderToken = vi.fn();
        const slf = {
            renderToken: mockRenderToken
        };
        const options = {};
        rule(tokens, idx, options, {}, slf);
        expect(tokens[0].attrs[idx][1]).toBe(expectedOutputSrc);
        expect(mockRenderToken).toHaveBeenCalledWith(tokens, idx, options);
    };

    it("initialises as expected", () => {
        getWrapper([]);
        expect(mockMarkdownItUse).toHaveBeenCalledWith(mockMarkdownItMathjaxPlugin);
        // Expect the initialisation code to have set the image rule in the markdownIt mock to a function which
        // rewrite local image src
        const imageRewriteRule = mockMarkdownIt.renderer.rules.image;
        expect(typeof imageRewriteRule).toBe("function");

        // Expect this rule to rewrite local image with app base url
        testImageRewriteRule(imageRewriteRule, "test.png", "http://localhost:3000/help/test.png");

        // Expect rule to leave images with absolute url src as they are
        const httpImg = "http://localhost:8080/static/test.png";
        testImageRewriteRule(imageRewriteRule, httpImg, httpImg);
        const httpsImg = "https://imagesite/public/test.png";
        testImageRewriteRule(imageRewriteRule, httpsImg, httpsImg);
    });

    it("renders as expected", () => {
        const markdown = ["## header", "text"];
        const wrapper = getWrapper(markdown);
        expect(mockRender).toHaveBeenCalledWith("## header\ntext");
        expect(wrapper.find(".markdown-panel").html()).toBe(`<div class="markdown-panel">${mockRenderOutput}</div>`);
    });

    it("renders nothing when markdown is empty", () => {
        const wrapper = getWrapper([]);
        expect(mockRender).not.toHaveBeenCalledWith();
        expect(wrapper.find(".markdown-panel").html()).toBe('<div class="markdown-panel"></div>');
    });

    it("calls Mathjax.typeset when mounted", () => {
        const mockTypeset = vi.fn();
        (window as any).MathJax = {
            typeset: mockTypeset
        };
        getWrapper([]);
        expect(mockTypeset).toHaveBeenCalledTimes(1);
    });
});
