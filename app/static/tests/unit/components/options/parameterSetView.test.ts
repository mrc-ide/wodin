import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockRunState } from "../../../mocks";
import ParameterSetView from "../../../../src/app/components/options/ParameterSetView.vue";
import { RunAction } from "../../../../src/app/store/run/actions";
import { RunMutation } from "../../../../src/app/store/run/mutations";

describe("ParameterSetView", () => {
    const mockDeleteParameterSet = jest.fn();
    const mockToggleParameterSetHidden = jest.fn();
    const mockTooltipDirective = jest.fn();
    const mockSwapParameterSet = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const getWrapper = (paramSetHidden = false, index = 0) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { alpha: 1, beta: 2, gamma: 3 }
                    }),
                    actions: {
                        [RunAction.DeleteParameterSet]: mockDeleteParameterSet,
                        [RunAction.SwapParameterSet]: mockSwapParameterSet
                    },
                    mutations: {
                        [RunMutation.ToggleParameterSetHidden]: mockToggleParameterSetHidden
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
                    parameterValues: { alpha: 0, beta: 2, gamma: 4 },
                    hidden: paramSetHidden
                },
                index
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

        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(3);
        const hideIcon = icons.at(0)!;
        expect(hideIcon.classes()).toContain("hide-param-set");
        expect(hideIcon.props("type")).toBe("eye-off");
        const swapIcon = icons.at(1)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("refresh-cw");
        const deleteIcon = icons.at(2)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");

        expect(wrapper.find(".card-body").classes()).not.toContain("hidden-parameter-set");
    });

    it("renders all trace line styles", () => {
        const testExpectedTraceClassForIndex = (index: number, expectedClass: string) => {
            const wrapper = getWrapper(false, index);
            expect(wrapper.find("div.trace").classes()).toContain(expectedClass);
        };
        testExpectedTraceClassForIndex(0, "trace-dot");
        testExpectedTraceClassForIndex(1, "trace-dash");
        testExpectedTraceClassForIndex(2, "trace-longdash");
        testExpectedTraceClassForIndex(3, "trace-dashdot");
        testExpectedTraceClassForIndex(4, "trace-longdashdot");
        testExpectedTraceClassForIndex(5, "trace-dot"); // back to start
    });

    it("uses tooltip directive", () => {
        const wrapper = getWrapper();
        expect(mockTooltipDirective).toHaveBeenCalledTimes(3);
        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(3);
        const hideIconEl = icons.at(0)!.element;
        expect(mockTooltipDirective.mock.calls[0][0]).toBe(hideIconEl);
        expect(mockTooltipDirective.mock.calls[0][1].value).toBe("Hide Parameter Set");
        const swapIconEl = icons.at(1)!.element;
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(swapIconEl);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Swap Parameter Set");
        const deleteIconEl = icons.at(2)!.element;
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(deleteIconEl);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Delete Parameter Set");
    });

    it("renders as expected when parameter set is hidden", () => {
        const wrapper = getWrapper(true);

        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(3);
        const showIcon = icons.at(0)!;
        expect(showIcon.classes()).toContain("show-param-set");
        expect(showIcon.props("type")).toBe("eye");
        const swapIcon = icons.at(1)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("refresh-cw");
        const deleteIcon = icons.at(2)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");

        expect(wrapper.find(".card-body").classes()).toContain("hidden-parameter-set");

        expect(mockTooltipDirective).toHaveBeenCalledTimes(3);
        expect(mockTooltipDirective.mock.calls[0][0]).toBe(showIcon.element);
        expect(mockTooltipDirective.mock.calls[0][1].value).toBe("Show Parameter Set");
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(swapIcon.element);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Swap Parameter Set");
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(deleteIcon.element);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Delete Parameter Set");
    });

    it("clicking delete icon dispatches DeleteParameterSet action", async () => {
        const wrapper = getWrapper();
        await wrapper.find(".delete-param-set").trigger("click");
        expect(mockDeleteParameterSet).toHaveBeenCalledTimes(1);
        expect(mockDeleteParameterSet.mock.calls[0][1]).toBe("Set 1");
    });

    it("clicking swap icon dispatches SwapParameterSet action", async () => {
        const wrapper = getWrapper();
        await wrapper.find(".swap-param-set").trigger("click");
        expect(mockSwapParameterSet).toHaveBeenCalledTimes(1);
        expect(mockSwapParameterSet.mock.calls[0][1]).toBe("Set 1");
    });

    it("clicking hide icon commits ToggleParameterSetHidden", async () => {
        const wrapper = getWrapper();
        await wrapper.find(".hide-param-set").trigger("click");
        expect(mockToggleParameterSetHidden).toHaveBeenCalledTimes(1);
        expect(mockToggleParameterSetHidden.mock.calls[0][1]).toBe("Set 1");
    });

    it("clicking show icon commits ToggleParameterSetHidden", async () => {
        const wrapper = getWrapper(true);
        await wrapper.find(".show-param-set").trigger("click");
        expect(mockToggleParameterSetHidden).toHaveBeenCalledTimes(1);
        expect(mockToggleParameterSetHidden.mock.calls[0][1]).toBe("Set 1");
    });
});
