import Vuex from "vuex";
import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState, mockRunState, mockModelState } from "../../../mocks";
import ParameterSetView from "../../../../src/components/options/ParameterSetView.vue";
import { RunAction } from "../../../../src/store/run/actions";
import { RunMutation } from "../../../../src/store/run/mutations";
import { getters } from "../../../../src/store/run/getters";

describe("ParameterSetView", () => {
    const mockDeleteParameterSet = vi.fn();
    const mockToggleParameterSetHidden = vi.fn();
    const mockTooltipDirective = vi.fn();
    const mockSwapParameterSet = vi.fn();
    const mockSaveParameterDisplayName = vi.fn();
    const mockTurnOffDisplayNameError = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    const getWrapper = (
        paramSetHidden = false,
        index = 0,
        modelChanged = false,
        compileRequired = false,
        dispNameErrorMsg = "",
        showUnchangedParameters = true
    ) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                model: mockModelState({ compileRequired })
            }),
            modules: {
                run: {
                    namespaced: true,
                    state: mockRunState({
                        parameterValues: { alpha: 1, beta: 2, gamma: 3 },
                        showUnchangedParameters,
                        runRequired: {
                            modelChanged,
                            parameterValueChanged: false,
                            endTimeChanged: false,
                            numberOfReplicatesChanged: false,
                            advancedSettingsChanged: false
                        }
                    }),
                    actions: {
                        [RunAction.DeleteParameterSet]: mockDeleteParameterSet,
                        [RunAction.SwapParameterSet]: mockSwapParameterSet
                    },
                    mutations: {
                        [RunMutation.ToggleParameterSetHidden]: mockToggleParameterSetHidden,
                        [RunMutation.SaveParameterDisplayName]: mockSaveParameterDisplayName,
                        [RunMutation.TurnOffDisplayNameError]: mockTurnOffDisplayNameError
                    },
                    getters
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
                    displayName: "Set 1",
                    displayNameErrorMsg: dispNameErrorMsg,
                    parameterValues: { alpha: 0, beta: 2, gamma: 4 },
                    hidden: paramSetHidden
                },
                index
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const displayNameText = wrapper.find(".card-header > div");
        const displayNameInput = wrapper.find("input");
        expect(displayNameText.text()).toBe("Set 1");
        expect(displayNameText.isVisible()).toBe(true);
        expect(displayNameInput.isVisible()).toBe(false);
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
        expect(icons.length).toBe(4);
        const editIcon = icons.at(0)!;
        expect(editIcon.classes()).toContain("edit-display-name");
        expect(editIcon.props("type")).toBe("edit");
        expect(editIcon.props("stroke")).toBe("currentColor");
        const hideIcon = icons.at(1)!;
        expect(hideIcon.classes()).toContain("hide-param-set");
        expect(hideIcon.props("type")).toBe("eye-off");
        expect(hideIcon.props("stroke")).toBe("currentColor");
        const swapIcon = icons.at(2)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("shuffle");
        expect(swapIcon.props("stroke")).toBe("black");
        expect((swapIcon.element as HTMLButtonElement).style.cursor).toBe("pointer");
        const deleteIcon = icons.at(3)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");
        expect(deleteIcon.props("stroke")).toBe("currentColor");

        expect(wrapper.find(".card-body").classes()).not.toContain("hidden-parameter-set");
    });

    it("renders all trace line styles", () => {
        const testExpectedTraceClassForIndex = (index: number, expectedClass: string) => {
            const wrapper = getWrapper(false, index);
            const cardBody = wrapper.find(".card-body");
            const lineStyle = cardBody.find(".trace-label");
            const traceLine = cardBody.find(".trace");
            expect(lineStyle.text()).toBe("Line Style");
            expect(traceLine.classes()).toContain(expectedClass);
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
        // 4 icons + 1 input tooltip
        expect(mockTooltipDirective).toHaveBeenCalledTimes(5);
        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(4);
        const editIconEl = icons.at(0)!.element;
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(editIconEl);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Rename Parameter Set");
        const hideIconEl = icons.at(1)!.element;
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(hideIconEl);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Hide Parameter Set");
        const swapIconEl = icons.at(2)!.element;
        expect(mockTooltipDirective.mock.calls[3][0]).toBe(swapIconEl);
        expect(mockTooltipDirective.mock.calls[3][1].value).toBe("Swap Parameter Set with Current Parameter Values");
        const deleteIconEl = icons.at(3)!.element;
        expect(mockTooltipDirective.mock.calls[4][0]).toBe(deleteIconEl);
        expect(mockTooltipDirective.mock.calls[4][1].value).toBe("Delete Parameter Set");
    });

    it("renders as expected when parameter set is hidden", () => {
        const wrapper = getWrapper(true);

        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(4);
        const editIcon = icons.at(0)!;
        expect(editIcon.classes()).toContain("edit-display-name");
        expect(editIcon.props("type")).toBe("edit");
        expect(editIcon.props("stroke")).toBe("currentColor");
        const showIcon = icons.at(1)!;
        expect(showIcon.classes()).toContain("show-param-set");
        expect(showIcon.props("type")).toBe("eye");
        const swapIcon = icons.at(2)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("shuffle");
        expect(swapIcon.props("stroke")).toBe("black");
        expect((swapIcon.element as HTMLButtonElement).style.cursor).toBe("pointer");
        const deleteIcon = icons.at(3)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");

        expect(wrapper.find(".card-body").classes()).toContain("hidden-parameter-set");

        expect(mockTooltipDirective).toHaveBeenCalledTimes(5);
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(editIcon.element);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Rename Parameter Set");
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(showIcon.element);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Show Parameter Set");
        expect(mockTooltipDirective.mock.calls[3][0]).toBe(swapIcon.element);
        expect(mockTooltipDirective.mock.calls[3][1].value).toBe("Swap Parameter Set with Current Parameter Values");
        expect(mockTooltipDirective.mock.calls[4][0]).toBe(deleteIcon.element);
        expect(mockTooltipDirective.mock.calls[4][1].value).toBe("Delete Parameter Set");
    });

    it("renders as expected when run is required", () => {
        const wrapper = getWrapper(false, 0, true);

        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(4);
        const editIcon = icons.at(0)!;
        expect(editIcon.classes()).toContain("edit-display-name");
        expect(editIcon.props("type")).toBe("edit");
        expect(editIcon.props("stroke")).toBe("currentColor");
        const showIcon = icons.at(1)!;
        expect(showIcon.classes()).toContain("hide-param-set");
        expect(showIcon.props("type")).toBe("eye-off");
        expect(showIcon.props("stroke")).toBe("currentColor");
        const swapIcon = icons.at(2)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("shuffle");
        expect(swapIcon.props("stroke")).toBe("lightgray");
        expect((swapIcon.element as HTMLButtonElement).style.cursor).toBe("default");
        const deleteIcon = icons.at(3)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");
        expect(deleteIcon.props("stroke")).toBe("currentColor");

        expect(mockTooltipDirective).toHaveBeenCalledTimes(5);
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(editIcon.element);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Rename Parameter Set");
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(showIcon.element);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Hide Parameter Set");
        expect(mockTooltipDirective.mock.calls[3][0]).toBe(swapIcon.element);
        expect(mockTooltipDirective.mock.calls[3][1].value).toBe("Swap Parameter Set with Current Parameter Values");
        expect(mockTooltipDirective.mock.calls[4][0]).toBe(deleteIcon.element);
        expect(mockTooltipDirective.mock.calls[4][1].value).toBe("Delete Parameter Set");
    });

    it("renders as expected when compile is required", () => {
        const wrapper = getWrapper(false, 0, false, true);

        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(4);
        const editIcon = icons.at(0)!;
        expect(editIcon.classes()).toContain("edit-display-name");
        expect(editIcon.props("type")).toBe("edit");
        expect(editIcon.props("stroke")).toBe("currentColor");
        const showIcon = icons.at(1)!;
        expect(showIcon.classes()).toContain("hide-param-set");
        expect(showIcon.props("type")).toBe("eye-off");
        expect(showIcon.props("stroke")).toBe("currentColor");
        const swapIcon = icons.at(2)!;
        expect(swapIcon.classes()).toContain("swap-param-set");
        expect(swapIcon.props("type")).toBe("shuffle");
        expect(swapIcon.props("stroke")).toBe("lightgray");
        expect((swapIcon.element as HTMLButtonElement).style.cursor).toBe("default");
        const deleteIcon = icons.at(3)!;
        expect(deleteIcon.classes()).toContain("delete-param-set");
        expect(deleteIcon.props("type")).toBe("trash-2");
        expect(deleteIcon.props("stroke")).toBe("currentColor");

        expect(mockTooltipDirective).toHaveBeenCalledTimes(5);
        expect(mockTooltipDirective.mock.calls[1][0]).toBe(editIcon.element);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Rename Parameter Set");
        expect(mockTooltipDirective.mock.calls[2][0]).toBe(showIcon.element);
        expect(mockTooltipDirective.mock.calls[2][1].value).toBe("Hide Parameter Set");
        expect(mockTooltipDirective.mock.calls[3][0]).toBe(swapIcon.element);
        expect(mockTooltipDirective.mock.calls[3][1].value).toBe("Swap Parameter Set with Current Parameter Values");
        expect(mockTooltipDirective.mock.calls[4][0]).toBe(deleteIcon.element);
        expect(mockTooltipDirective.mock.calls[4][1].value).toBe("Delete Parameter Set");
    });

    it("renders as expected when editing display name", async () => {
        const wrapper = getWrapper(false, 0, false, false);
        const icons = wrapper.findAllComponents(VueFeather);
        expect(icons.length).toBe(4);
        const editIcon = icons.at(0)!;
        expect(editIcon.classes()).toContain("edit-display-name");
        expect(editIcon.props("type")).toBe("edit");
        expect(editIcon.props("stroke")).toBe("currentColor");

        expect(mockTooltipDirective.mock.calls[1][0]).toBe(editIcon.element);
        expect(mockTooltipDirective.mock.calls[1][1].value).toBe("Rename Parameter Set");

        await editIcon.trigger("click");

        const newIcons = wrapper.findAllComponents(VueFeather);
        expect(newIcons.length).toBe(1);
        const saveIcon = newIcons.at(0)!;
        expect(saveIcon.classes()).toContain("save-display-name");
        expect(saveIcon.props("type")).toBe("save");
        expect(saveIcon.props("stroke")).toBe("currentColor");

        const displayNameText = wrapper.find(".card-header > div");
        const displayNameInput = wrapper.find("input");
        expect(displayNameInput.isVisible()).toBe(true);
        expect(displayNameInput.element.value).toBe("Set 1");
        expect(displayNameText.isVisible()).toBe(false);

        // 4 on mount + 1 input on mount + 2nd one is saveIcon
        expect(mockTooltipDirective.mock.calls[6][0]).toBe(saveIcon.element);
        expect(mockTooltipDirective.mock.calls[6][1].value).toBe("Save Parameter Set Name");
    });

    it("commits save parameter display name mutation when save icon clicked", async () => {
        const wrapper = getWrapper(false, 0, false, false);
        const editIcon = wrapper.findAllComponents(VueFeather)[0];
        expect(mockSaveParameterDisplayName).toHaveBeenCalledTimes(0);

        await editIcon.trigger("click");

        expect(mockSaveParameterDisplayName).toHaveBeenCalledTimes(0);
        const saveIcon = wrapper.findAllComponents(VueFeather)[0];

        await saveIcon.trigger("click");
        expect(mockSaveParameterDisplayName).toHaveBeenCalledTimes(1);
    });

    it("commits turn off error message + can cancel rename when you blur input", async () => {
        const wrapper = getWrapper(false, 0, false, false);
        const editIcon = wrapper.findAllComponents(VueFeather)[0];
        await editIcon.trigger("click");
        const input = wrapper.find("input");

        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(0);
        await input.setValue("hey");
        await input.trigger("blur");
        // watchers don't work so we won't get turn off error commit
        // from changing value in input, only from blur
        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(1);
        expect(input.element.value).toBe("Set 1");
        const editIcon1 = wrapper.findAllComponents(VueFeather)[0];
        expect(editIcon1.props("type")).toBe("edit");
    });

    it("does not cancel rename when you blur input by clicking on save button", async () => {
        const wrapper = getWrapper(false, 0, false, false);
        const editIcon = wrapper.findAllComponents(VueFeather)[0];
        await editIcon.trigger("click");
        const input = wrapper.find("input");
        await input.setValue("hey");
        // cannot do event.relatedTarget testing by triggering DOM events so
        // have to trigger this manually and put in saveButton as the relatedEvent
        // and make sure the cancelEditDisplayName function does no updates
        (wrapper.vm as any).cancelEditDisplayName({ relatedTarget: (wrapper.vm as any).saveButton.$el });
        await nextTick();
        const input1 = wrapper.find("input");
        expect(input1.element.value).toBe("hey");
        const saveIcon = wrapper.findAllComponents(VueFeather)[0];
        expect(saveIcon.props("type")).toBe("save");
        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(0);
    });

    it("commits display name error off mutation if there is error", async () => {
        const wrapper = getWrapper(false, 0, false, false, "error");
        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(0);

        (wrapper.vm as any).turnOffDisplayNameError();
        await nextTick();

        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(1);
    });

    it("does not commit display name error off mutation if there is no error", async () => {
        const wrapper = getWrapper(false, 0, false, false);
        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(0);

        (wrapper.vm as any).turnOffDisplayNameError();
        await nextTick();

        expect(mockTurnOffDisplayNameError).toHaveBeenCalledTimes(0);
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

    it("should not show same parameters when showUnchangedParameters is false", () => {
        const wrapper = getWrapper(false, 0, false, false, "", false);
        const paramSpans = wrapper.findAll(".card-body span.badge");
        expect(paramSpans.length).toBe(2);
        expect(paramSpans[0].text()).toBe("alpha: 0");
        expect(paramSpans[1].text()).toBe("gamma: 4");
    });
});
