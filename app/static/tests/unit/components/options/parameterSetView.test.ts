import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockRunState } from "../../../mocks";
import ParameterSetView from "../../../../src/app/components/options/ParameterSetView.vue";

describe("ParameterSetView", () => {
    it("renders as expected", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                run: mockRunState({
                    parameterValues: { alpha: 1, beta: 2, gamma: 3 }
                })
            } as any
        });
        const wrapper = shallowMount(ParameterSetView, {
            global: {
                plugins: [store]
            },
            props: {
                parameterSet: {
                    name: "Set 1",
                    parameterValues: { alpha: 0, beta: 2, gamma: 4 }
                }
            }
        });
        expect(wrapper.find(".card-header").text()).toBe("Set 1");
        const paramSpans = wrapper.findAll(".card-body span.badge");
        expect(paramSpans.length).toBe(3);
        expect(paramSpans[0].text()).toBe("alpha: 0");
        expect((paramSpans[0].element as HTMLSpanElement).style.color).toEqual("rgb(220, 53, 69)");
        expect((paramSpans[0].element as HTMLSpanElement).style.borderColor).toEqual("#dc3545");
        expect(paramSpans[1].text()).toBe("beta: 2");
        expect((paramSpans[1].element as HTMLSpanElement).style.color).toBe("rgb(187, 187, 187)");
        expect((paramSpans[1].element as HTMLSpanElement).style.borderColor).toBe("#bbb");
        expect(paramSpans[2].text()).toBe("gamma: 4");
        expect((paramSpans[2].element as HTMLSpanElement).style.color).toBe("rgb(71, 159, 182)");
        expect((paramSpans[2].element as HTMLSpanElement).style.borderColor).toBe("#479fb6");
    });
});
