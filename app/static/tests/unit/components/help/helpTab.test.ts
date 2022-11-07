import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import HelpTab from "../../../../src/app/components/help/HelpTab.vue";
import MarkdownPanel from "../../../../src/app/components/help/MarkdownPanel.vue";

describe("HelpTab", () => {
    it("renders markdown panel with markdown from state", () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                config: {
                    help: {
                        markdown: ["test md"]
                    }
                } as any
            })
        });
        const options = {
            global: {
                plugins: [store]
            }
        };
        const wrapper = shallowMount(HelpTab, options);
        expect(wrapper.findComponent(MarkdownPanel).props("markdown")).toStrictEqual(["test md"]);
    });
});
