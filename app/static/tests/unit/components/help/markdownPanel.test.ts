// Mock imports of third party packages so we can mock their methods before importing component
const mockMarkdownItMathjaxPlugin = {};
const mockRenderOutput = "<span>mockRenderOutput</span>";
const mockRender = jest.fn().mockReturnValue(mockRenderOutput);
const mockMarkdownIt = {
  renderer: {
    rules: {
      // image prop will be set by component
    }
  },
  render: mockRender
} as any;
const mockMarkdownItUse = jest.fn().mockReturnValue(mockMarkdownIt);
jest.mock("markdown-it-mathjax", () => ({ __esModule: true, default: () => mockMarkdownItMathjaxPlugin }));

jest.mock("../../../../src/app/components/help/MarkdownItImport.ts", () => {
  // mock constructor - this cannot be an arrow function, see
  // https://stackoverflow.com/questions/47402005
  // eslint-disable-next-line func-names
  return function () {
    return {
      use: mockMarkdownItUse
    };
  };
});

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import MarkdownPanel from "../../../../src/app/components/help/MarkdownPanel.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
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
    jest.clearAllMocks();
  });

  // eslint-disable-next-line @typescript-eslint/ban-types
  const testImageRewriteRule = (rule: Function, imgSrc: string, expectedOutputSrc: string) => {
    const tokens = [
      {
        attrIndex: () => 0,
        attrs: [["src", imgSrc]]
      }
    ];
    const idx = 0;
    const mockRenderToken = jest.fn();
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
    const mockTypeset = jest.fn();
    (window as any).MathJax = {
      typeset: mockTypeset
    };
    getWrapper([]);
    expect(mockTypeset).toHaveBeenCalledTimes(1);
  });
});
