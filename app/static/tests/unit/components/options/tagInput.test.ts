import { nextTick } from "vue";
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import VueTagsInput from "vue3-tags-input";
import TagInput from "../../../../src/app/components/options/TagInput.vue";
import { mockRunState } from "../../../mocks";

describe("Tag Input", () => {
    const createStore = () => {
        return new Vuex.Store({
            state: {
                run: mockRunState({
                    parameterValues: { p1: 1.1, p2: 2.2 }
                })
            }
        });
    };

    const defaultProps = {
        tags: [1, 2, "p1", "p2", "p3"],
        numericOnly: false
    };

    const getWrapper = (props = defaultProps) => {
        return shallowMount(TagInput, { props, global: { plugins: [createStore()] } });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const tagsInput = wrapper.findComponent(VueTagsInput);
        expect(tagsInput.exists()).toBe(true);
        expect(tagsInput.attributes("style")).toBe("border-color: #d7dce1;");
        expect(tagsInput.props("tags")).toStrictEqual(["1", "2", "p1: 1.1", "p2: 2.2"]);
        expect(tagsInput.props("placeholder")).toBe("...");
    });

    it("parses tags correctly when changed", () => {
        const wrapper = getWrapper();
        const tagsInput = wrapper.findComponent(VueTagsInput);
        (tagsInput.vm as any).$emit("on-tags-changed", ["1", "2", "p2", "p1: 1.1", "p3"]);
        expect(wrapper.emitted("update")![0]).toStrictEqual([[1, 2, "p2", "p1"]]);
    });

    it("validate function works as expected", () => {
        const wrapper = getWrapper();
        expect((wrapper.vm as any).validate("p1")).toBe(false);
        expect((wrapper.vm as any).validate("1")).toBe(false);
        expect((wrapper.vm as any).validate("p2: 2.2")).toBe(false);
        expect((wrapper.vm as any).validate("3")).toBe(true);
        expect((wrapper.vm as any).validate("p3")).toBe(false);
    });

    it("tags as empty array if no tags", () => {
        const wrapper = getWrapper({
            tags: null,
            placeholder: []
        } as any);
        const tagsInput = wrapper.findComponent(VueTagsInput);
        expect(tagsInput.props("tags")).toStrictEqual([]);
    });

    it("emits update if paramValues change", async () => {
        const store = createStore();
        const wrapper = shallowMount(TagInput, {
            global: {
                plugins: [store]
            },
            props: {
                tags: ["1", "hey"],
                placeholder: []
            }
        });
        store.state.run.parameterValues = { a: 2 };
        await nextTick();
        expect(wrapper.emitted("update")![0]).toStrictEqual([["1", "hey"]]);
    });

    it("renders as expected when numeric only is true", () => {
        const wrapper = getWrapper({ ...defaultProps, numericOnly: true});
        const tagsInput = wrapper.findComponent(VueTagsInput);
        // should filter out non-numeric tags
        expect(tagsInput.props("tags")).toStrictEqual(["1", "2"]);
        expect(tagsInput.props("placeholder")).toBe("...");
    });

    it("does not accept update with valid parameter tags when numericOnly is true", () => {
        const wrapper = getWrapper({ ...defaultProps, numericOnly: true });
        const tagsInput = wrapper.findComponent(VueTagsInput);
        (tagsInput.vm as any).$emit("on-tags-changed", ["1", "2", "p2", "p1: 1.1", "p3"]);
        expect(wrapper.emitted("update")![0]).toStrictEqual([[1, 2]]);
    });
});
