import Vuex from 'vuex';
import { shallowMount, mount } from "@vue/test-utils";
import LanguageSwitcher from "../../src/LanguageSwitcher.vue";

describe("languageSwitcher component", () => {
    const mockUpdateLanguage = jest.fn();

    const createStore = (enableI18n: boolean) => {
        return new Vuex.Store({
            modules: {
                language: {
                    namespaced: true,
                    state: {
                        currentLanguage: "en",
                        updatingLanguage: false,
                        enableI18n
                    },
                    actions: {
                        UpdateLanguage: mockUpdateLanguage
                    }
                }
            }
        })
    }

    const getWrapper = (isMount: boolean, enableI18n = true) => {
        if (isMount) {
            return mount(LanguageSwitcher, {
                props: {
                    languagesKeys: {
                        "en": "English",
                        "fr": "French"
                    }
                },
                global: {
                    plugins: [createStore(enableI18n)]
                }
            });
        } else {
            return shallowMount(LanguageSwitcher, {
                props: {
                    languagesKeys: {
                        "en": "English",
                        "fr": "French"
                    }
                },
                global: {
                    plugins: [createStore(enableI18n)]
                }
            });
        }
    };

    it("renders as expected", () => {
        const wrapper = getWrapper(false);
        expect(wrapper.find("div").classes()).toStrictEqual(["navbar-text", "navbar-version", "me-3"]);
        expect(wrapper.find("drop-down-stub").attributes("text")).toBe("English")
    });

    it("changing language dispatches updateLanguage action", async () => {
        const wrapper = getWrapper(true);
        await wrapper.trigger("click");
        expect(mockUpdateLanguage).toBeCalledTimes(0);
        const menuItems = wrapper.findAll("li");
        await menuItems[1].find("span").trigger("click");
        expect(mockUpdateLanguage).toBeCalledTimes(1);
    });

    it("disabling i18n returns empty wrapper", () => {
        const wrapper = getWrapper(false, false);
        expect(wrapper.html()).toBe("<!--v-if-->")
    })
});
