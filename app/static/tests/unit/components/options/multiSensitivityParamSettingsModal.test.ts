import Vuex from "vuex";
import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import {
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import { MultiSensitivityMutation } from "../../../../src/app/store/multiSensitivity/mutations";
import MultiSensitivityParamSettingsModal from "../../../../src/app/components/options/MultiSensitivityParamSettingsModal.vue";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";

const mockTooltipDirective = jest.fn();
describe("SensitivityParamSettingsModal", () => {
    const mockSetParamSettings = jest.fn();

    const paramSettings = [
        {
            parameterToVary: "B",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 10,
            rangeFrom: 0,
            rangeTo: 0,
            numberOfRuns: 5
        },
        {
            parameterToVary: "C",
            scaleType: SensitivityScaleType.Logarithmic,
            variationType: SensitivityVariationType.Range,
            variationPercentage: 20,
            rangeFrom: 10,
            rangeTo: 30,
            numberOfRuns: 10
        }
    ];

    const getWrapper = async (open = true) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                multiSensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings
                    },
                    mutations: {
                        [MultiSensitivityMutation.SetParamSettings]: mockSetParamSettings
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        parameterValues: {
                            B: 2,
                            C: 3,
                            D: 4,
                            E: 5
                        }
                    }
                }
            }
        });
        const wrapper = shallowMount(MultiSensitivityParamSettingsModal, {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            },
            props: {
                open: false
            }
        });

        // We open after mounting to trigger the component to take an internal copy of store settings to edit
        if (open) {
            await wrapper.setProps({ open: true });
        }
        return wrapper;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected", async () => {
        const wrapper = await getWrapper();
        expect(wrapper.find(".modal").classes()).toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("block");
        expect(wrapper.find(".modal-backdrop").exists()).toBe(true);

        expect(wrapper.find(".modal-header").text()).toBe("Vary Parameters");

        const editContainers = wrapper.findAll(".multi-sens-edit");
        expect(editContainers.length).toBe(2);
        const editParams1 = editContainers[0].findComponent(EditParamSettings);
        expect(editParams1.props().settings).toStrictEqual(paramSettings[0]);
        expect(editContainers[0].findComponent(VueFeather).exists()).toBe(false); // no delete control for first editor
        const editParams2 = editContainers[1].findComponent(EditParamSettings);
        expect(editParams2.props().settings).toStrictEqual(paramSettings[1]);
        expect(editContainers[1].findComponent(VueFeather).attributes().type).toBe("trash-2");

        expect(wrapper.find(".modal-footer button.btn-primary").text()).toBe("OK");
        expect(wrapper.find(".modal-footer button.btn-primary").attributes("disabled")).toBe(undefined);
        expect(wrapper.find(".modal-footer button.btn-outline").text()).toBe("Cancel");
    });

    it("hides modal if not open", async () => {
        const wrapper = await getWrapper(false);
        expect(wrapper.find(".modal").classes()).not.toContain("show");
        expect((wrapper.find(".modal").element as HTMLElement).style.display).toBe("none");
        expect(wrapper.find(".modal-backdrop").exists()).toBe(false);
    });

    it("closes on cancel click", async () => {
        const wrapper = await getWrapper();
        await wrapper.find("#cancel-settings").trigger("click");
        expect(wrapper.emitted("close")?.length).toBe(1);
    });

    it("handles updates from EditParamSettings, and saves to store on OK", async () => {
        const updatedSettings1 = {
            ...paramSettings[0],
            parameterToVary: "D",
            numberOfRuns: 20
        };
        const updatedSettings2 = {
            ...paramSettings[1],
            parameterToVary: "E",
            rangeTo: 50
        };
        const wrapper = await getWrapper();
        const editContainers = wrapper.findAll(".multi-sens-edit");
        const editParams2 = editContainers[1].findComponent(EditParamSettings);
        editParams2.vm.$emit("update", updatedSettings2);
        const editParams1 = editContainers[0].findComponent(EditParamSettings);
        editParams1.vm.$emit("update", updatedSettings1);
        await wrapper.find("#ok-settings").trigger("click");
        expect(mockSetParamSettings).toHaveBeenCalledTimes(1);
        expect(mockSetParamSettings.mock.calls[0][1]).toStrictEqual([updatedSettings1, updatedSettings2]);
        expect(wrapper.emitted("close")?.length).toBe(1);
    });

    it("disables and enables button as expected when batchParsError changes", async () => {
        const wrapper = await getWrapper();
        const editContainers = wrapper.findAll(".multi-sens-edit");
        const editParams1 = editContainers[0].findComponent(EditParamSettings);
        editParams1.vm.$emit("batchParsErrorChange", { error: "test error" });
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(true);

        const editParams2 = editContainers[1].findComponent(EditParamSettings);
        editParams2.vm.$emit("batchParsErrorChange", { error: "test error" });
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(true);

        // Both editors now in error
        editParams1.vm.$emit("batchParsErrorChange", null);
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(true);

        editParams2.vm.$emit("batchParsErrorChange", null);
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(false);
    });

    it("adds parameter to vary", async () => {
        const wrapper = await getWrapper();
        await wrapper.find("button#add-param-to-vary").trigger("click");
        const editContainers = wrapper.findAll(".multi-sens-edit");
        expect(editContainers.length).toBe(3);
        const newEditParams = editContainers[2].findComponent(EditParamSettings);
        const expectedNewSettings = {
            parameterToVary: "D",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 10,
            rangeFrom: 0,
            rangeTo: 0,
            numberOfRuns: 10
        };
        expect(newEditParams.props().settings).toStrictEqual(expectedNewSettings);
        await wrapper.find("#ok-settings").trigger("click");
        expect(mockSetParamSettings.mock.calls[0][1]).toStrictEqual([...paramSettings, expectedNewSettings]);
    });

    it("deletes parameter to vary", async () => {
        const wrapper = await getWrapper();
        await wrapper.find(".delete-param-to-vary").trigger("click");
        expect(wrapper.findAll(".multi-sens-edit").length).toBe(1);
        expect(wrapper.findComponent(EditParamSettings).props().settings).toStrictEqual(paramSettings[0]);
        await wrapper.find("#ok-settings").trigger("click");
        expect(mockSetParamSettings.mock.calls[0][1]).toStrictEqual([paramSettings[0]]);
    });

    it("does not add another parameter to vary if there are none which are not already being shown", async () => {
        const wrapper = await getWrapper();
        const addButton = wrapper.find("button#add-param-to-vary");
        await addButton.trigger("click");
        expect(wrapper.findAll(".multi-sens-edit").length).toBe(3);
        expect(wrapper.findAllComponents(EditParamSettings)[2].props().settings.parameterToVary).toBe("D");
        await addButton.trigger("click");
        expect(wrapper.findAll(".multi-sens-edit").length).toBe(4);
        expect(wrapper.findAllComponents(EditParamSettings)[3].props().settings.parameterToVary).toBe("E");
        await addButton.trigger("click");
        expect(wrapper.findAll(".multi-sens-edit").length).toBe(4);
    });

    it("enables OK button when parameter editor in error is deleted", async () => {
        const wrapper = await getWrapper();
        const editContainers = wrapper.findAll(".multi-sens-edit");
        const editParams = editContainers[1].findComponent(EditParamSettings);
        editParams.vm.$emit("batchParsErrorChange", {error: "test error"});
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(true);
        await wrapper.find(".delete-param-to-vary").trigger("click");
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(false);
    });
});