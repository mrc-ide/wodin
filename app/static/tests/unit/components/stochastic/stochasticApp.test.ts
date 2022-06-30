import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import StochasticApp from "../../../../src/app/components/stochastic/StochasticApp.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import { mockStochasticState } from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { AppStateAction } from "../../../../src/app/store/appState/actions";

describe("StochasticApp", () => {
    const getWrapper = () => {
        const props = {
            appName: "testApp"
        };

        const store = new Vuex.Store<StochasticState>({
            state: mockStochasticState({ config: {} as any }),
            actions: {
                [AppStateAction.FetchConfig]: jest.fn()
            },
            modules: {
                errors: {
                    namespaced: true,
                    state: { errors: [] }
                },
                model: {
                    namespaced: true,
                    actions: {
                        [ModelAction.FetchOdinRunner]: jest.fn()
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props
        };

        return mount(StochasticApp, options);
    };

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);
        expect(wodinApp.props("appName")).toBe("testApp");

        const wodinPanels = wodinApp.findComponent(WodinPanels);
        const leftPanel = wodinPanels.find(".wodin-left");
        const leftTabs = leftPanel.find("#left-tabs");
        const leftTabLinks = leftTabs.findAll("ul li a");
        expect(leftTabLinks.length).toBe(1);
        expect(leftTabLinks.at(0)!.text()).toBe("Code");
        expect(leftTabs.find("div.mt-4").text()).toBe("Coming soon: Stochastic apps");

        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(1);
        expect(rightTabLinks.at(0)!.text()).toBe("Run");
        expect(rightTabs.find("div.mt-4").text()).toBe("Coming soon: Stochastic apps");
    });
});
