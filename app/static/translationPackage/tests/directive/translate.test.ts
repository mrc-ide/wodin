import {mount, shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import registerTranslations from "../../registerTranslations";
import translate from "../../directive/translate";
import { nextTick } from "vue";

describe("translate directive", () => {

    beforeAll(() => {
        console.warn = jest.fn();
    });

    afterAll(() => {
        (console.warn as jest.Mock).mockClear();
    });

    const TranslateAttributeTest = {
        template: '<input v-translate:value="\'validate\'" />'
    };

    const TranslateLowercaseAttributeTest = {
        template: '<input v-translate:value.lowercase="\'validate\'" />'
    };

    const TranslateInnerTextTestStatic = {
        template: '<h4 v-translate="\'validate\'"></h4>'
    };

    const TranslateInnerTextTestDynamic = {
        template: '<h4 v-translate="text"></h4>',
        data() {
            return {
                text: "validate"
            }
        }
    };

    const TranslateMultiple = {
        template: '<input v-translate:value="\'validate\'" v-translate:placeholder="\'email\'"/>',
    };

    const createStore = () => {
        const store = new Vuex.Store({
            state: {
                language: {
                    currentLanguage: "en",
                    updatingLanguage: false,
                    enableI18n: true
                }
            }
        });
        registerTranslations(store.state.language, {
            en: [{
                validate: "Validate",
                email: "Email address",
                logout: "Logout"
            }],
            fr: [{
                validate: "Valider",
                email: "Adresse e-mail",
                logout: "Fermer une session"
            }]
        });
        return store as any;
    };

    it("initialises the attribute with the translated text", () => {
        const store = createStore();
        const rendered = shallowMount(TranslateAttributeTest, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect((rendered.find("input").element as HTMLInputElement).value).toBe("Validate");
    });

    it("makes translated text lowercase if modifier specified", () => {
        const store = createStore();
        const rendered = shallowMount(TranslateLowercaseAttributeTest, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect((rendered.find("input").element as HTMLInputElement).value).toBe("validate");
    });

    it("translates the attribute when the store language changes", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateAttributeTest, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect((rendered.find("input").element as HTMLInputElement).value).toBe("Validate");
        store.state.language.currentLanguage = "fr";
        await nextTick();
        expect((rendered.find("input").element as HTMLInputElement).value).toBe("Valider");
    });

    it("initialises inner text with translated text", () => {
        const store = createStore();
        const renderedStatic = mount(TranslateInnerTextTestStatic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(renderedStatic.find("h4").text()).toBe("Validate");

        const renderedDynamic = mount(TranslateInnerTextTestDynamic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(renderedDynamic.find("h4").text()).toBe("Validate");
    });

    it("translates static inner text when the store language changes", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateInnerTextTestStatic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(rendered.find("h4").text()).toBe("Validate");
        store.state.language.currentLanguage = "fr";
        await nextTick();
        expect(rendered.find("h4").text()).toBe("Valider");
    });

    it("translates dynamic inner text when the store language changes", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateInnerTextTestDynamic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(rendered.find("h4").text()).toBe("Validate");
        store.state.language.currentLanguage = "fr";
        await nextTick();
        expect(rendered.find("h4").text()).toBe("Valider");
    });

    it("updates dynamic inner text when the key changes", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateInnerTextTestDynamic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(rendered.find("h4").text()).toBe("Validate");
        await rendered.setData({
            text: "email"
        });
        expect(rendered.find("h4").text()).toBe("Email address");
    });

    it("can update language and key in any order", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateInnerTextTestDynamic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(rendered.find("h4").text()).toBe("Validate");
        store.state.language.currentLanguage = "fr";
        await nextTick();
        expect(rendered.find("h4").text()).toBe("Valider");
        await rendered.setData({
            text: "email"
        });
        expect(rendered.find("h4").text()).toBe("Adresse e-mail");
        store.state.language.currentLanguage = "en";
        await nextTick();
        expect(rendered.find("h4").text()).toBe("Email address");
    });

    it("can support multiple directives for different attributes on the same element", async () => {
        const store = createStore();
        const rendered = shallowMount(TranslateMultiple, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        let input = (rendered.find("input").element as HTMLInputElement);
        expect(input.value).toBe("Validate");
        expect(input.placeholder).toBe("Email address");

        store.state.language.currentLanguage = "fr";
        await nextTick();

        input = (rendered.find("input").element as HTMLInputElement);
        expect(input.value).toBe("Valider");
        expect(input.placeholder).toBe("Adresse e-mail");
    });

    it("does nothing but warns if binding is invalid", () => {
        const InvalidBinding = {
            template: '<h4 v-translate=""></h4>'
        };
        const store = createStore();
        const rendered = shallowMount(InvalidBinding, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect(rendered.find("h4").text()).toBe("");
        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe("v-translate directive declared without a value");
    });

    it("unwatches on unbind", () => {
        const store = createStore();
        const renderedAttribute = shallowMount(TranslateAttributeTest, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        const renderedText = shallowMount(TranslateInnerTextTestDynamic, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        const renderedMultiple = shallowMount(TranslateMultiple, {
            global: {
                plugins: [store],
                directives: {
                    translate: translate(store)
                }
            }
        });
        expect((store._watcherVM as any)._watchers.length).toBe(5);
        renderedAttribute.destroy();
        expect((store._watcherVM as any)._watchers.length).toBe(4);
        renderedText.destroy();
        expect((store._watcherVM as any)._watchers.length).toBe(3);
        renderedMultiple.destroy();
        expect((store._watcherVM as any)._watchers.length).toBe(0);
    });

});
