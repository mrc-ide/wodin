import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockVersionsState } from "../../../mocks";
import VersionMenu from "../../../../src/app/components/header/VersionMenu.vue";
import DropDown from "../../../../src/app/components/DropDown.vue";

describe("version menu component", () => {
    const mockVersionsAction = jest.fn();

    const versions = {
        dfoptim: "0.0.5",
        dopri: "0.0.12",
        odin: "1.3.14",
        "odin.api": "0.1.6",
        odinjs: "0.0.14"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({}),
            modules: {
                versions: {
                    namespaced: true,
                    state: mockVersionsState({ versions }),
                    actions: {
                        GetVersions: mockVersionsAction
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                wodinVersion: "1.2.3"
            }
        };

        return mount(VersionMenu, options);
    };

    it("can render version menu items", () => {
        const wrapper = getWrapper();
        expect(wrapper.props("wodinVersion")).toBe("1.2.3");
        expect(wrapper.find(".dropdown a").text()).toBe("WODIN v1.2.3");
        expect(wrapper.find(".dropdown ul").classes())
            .toEqual(["dropdown-menu", "dropdown-menu-end"]);

        const lists = wrapper.findAll("li span");
        expect(lists.length).toBe(5);
        expect(lists.at(0)?.classes()).toEqual(["dropdown-item"]);
        expect(lists.at(0)?.text()).toBe("dfoptim : v0.0.5");
        expect(lists.at(1)?.text()).toBe("dopri : v0.0.12");
        expect(lists.at(2)?.text()).toBe("odin : v1.3.14");
        expect(lists.at(3)?.text()).toBe("odin.api : v0.1.6");
        expect(lists.at(4)?.text()).toBe("odinjs : v0.0.14");
    });

    it("calls action when component is mounted", () => {
        const wrapper = getWrapper();
        expect(mockVersionsAction).toHaveBeenCalledTimes(1);
        expect(wrapper.findComponent(DropDown).exists()).toBe(true);
    });
});
