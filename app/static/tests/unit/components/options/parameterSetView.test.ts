import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockRunState } from "../../../mocks";
import ParameterSetView from "../../../../src/app/components/options/ParameterSetView.vue";
import { RunAction } from "../../../../src/app/store/run/actions";

describe("ParameterSetView", () => {
    const mockDeleteParameterSet = jest.fn();
    const mockTooltipDirective = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const getWrapper = () => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { alpha: 1, beta: 2, gamma: 3 }
                    }),
                    actions: {
                        [RunAction.DeleteParameterSet]: mockDeleteParameterSet
                    }
                }
            }
        });
        return shallowMount(ParameterSetView, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            },
            props: {
                parameterSet: {
                    name: "Set 1",
                    parameterValues: { alpha: 0, beta: 2, gamma: 4 }
                }
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
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

        const deleteIcon = wrapper.findComponent(VueFeather);
        expect(deleteIcon.props("type")).toBe("trash-2");
    });

    it("uses tooltip directive", () => {
        const wrapper = getWrapper();
        expect(mockTooltipDirective).toHaveBeenCalledTimes(1);
        const iconElement = wrapper.findComponent(VueFeather).element;
        expect(mockTooltipDirective.mock.calls[0][0]).toBe(iconElement);
        expect(mockTooltipDirective.mock.calls[0][1].value).toBe("Delete Parameter Set");
    });

    it("clicking delete icon dispatches DeleteParameterSet action", async () => {
        const wrapper = getWrapper();
        await wrapper.findComponent(VueFeather).trigger("click");
        expect(mockDeleteParameterSet).toHaveBeenCalledTimes(1);
        expect(mockDeleteParameterSet.mock.calls[0][1]).toBe("Set 1");
    });
});
