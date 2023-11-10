import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import LoadingSpinner from "../../../src/app/components/LoadingSpinner.vue";
import WodinPanels from "../../../src/app/components/WodinPanels.vue";
import ErrorsAlert from "../../../src/app/components/ErrorsAlert.vue";
import WodinApp from "../../../src/app/components/WodinApp.vue";

function mockResizeObserver(this: any) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("WodinApp", () => {
  const getWrapper = (includeConfig = true) => {
    const config = includeConfig ? { basicProp: "Test basic prop value" } : null;
    const state = mockBasicState({ config } as any);
    const props = {
      title: "Test Title",
      appName: "testApp"
    };
    const store = new Vuex.Store<BasicState>({
      state,
      modules: {
        errors: {
          namespaced: true,
          state: {
            errors: []
          }
        }
      }
    });

    const options = {
      global: {
        plugins: [store]
      },
      props,
      slots: {
        left: "<div id='l-content'>Left slot content</div>",
        right: "<div id='r-content'>Right slot content</div>"
      }
    };

    return mount(WodinApp, options);
  };

  it("renders as expected when config is set", () => {
    const wrapper = getWrapper();
    const panels = wrapper.findComponent(WodinPanels);
    expect(panels.find("#l-content").text()).toBe("Left slot content");
    expect(panels.find("#r-content").text()).toBe("Right slot content");

    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false);
    expect(wrapper.find("h2").exists()).toBe(false);

    expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
  });

  it("renders loading spinner when config is not set", () => {
    const wrapper = getWrapper(false);
    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
    expect(wrapper.find("h2").text()).toBe("Loading application...");

    expect(wrapper.findComponent(WodinPanels).exists()).toBe(false);
    expect(wrapper.find("#l-content").exists()).toBe(false);
    expect(wrapper.find("#r-content").exists()).toBe(false);

    expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
  });
});
