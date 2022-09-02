import { shallowMount } from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex from "vuex";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState, mockModelState } from "../../mocks";
import { ModelAction } from "../../../src/app/store/model/actions";
import { BasicState } from "../../../src/app/store/basic/state";

describe("WodinSession", () => {
    const mockFetchConfig = jest.fn();
    const mockFetchOdinRunner = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            actions: {
                [AppStateAction.FetchConfig]: mockFetchConfig
            },
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: mockFetchOdinRunner
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                appName: "testApp"
            }
        };

        return shallowMount(WodinSession, options);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
    });

    it("dispatches actions on mount", () => {
        getWrapper();
        expect(mockFetchOdinRunner).toHaveBeenCalledTimes(1);
        expect(mockFetchConfig).toHaveBeenCalledTimes(1);
        expect(mockFetchConfig.mock.calls[0][1]).toBe("testApp");
    });
});
