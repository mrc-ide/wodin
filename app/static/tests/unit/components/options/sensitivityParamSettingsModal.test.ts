import Vuex from "vuex";
import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import {
    SensitivityScaleType,
    SensitivityVariationType
} from "../../../../src/app/store/sensitivity/state";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import SensitivityParamSettingsModal from "../../../../src/app/components/options/SensitivityParamSettingsModal.vue";
import EditParamSettings from "../../../../src/app/components/options/EditParamSettings.vue";

describe("SensitivityParamSettingsModal", () => {
    const mockSetParamSettings = jest.fn();

    const paramSettings = {
        parameterToVary: "B",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 5
    };

    const getWrapper = async (open = true) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings
                    },
                    mutations: {
                        [SensitivityMutation.SetParamSettings]: mockSetParamSettings
                    }
                }
            }
        });
        const wrapper = shallowMount(SensitivityParamSettingsModal, {
            global: {
                plugins: [store],
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

        expect(wrapper.find(".modal-header").text()).toBe("Vary Parameter");
        const editParams = wrapper.findComponent(EditParamSettings);
        expect(editParams.props().settings).toStrictEqual(paramSettings);

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

    it("handles update from EditParamSettings, and saves to store on OK", async () => {
        const updatedSettings = {
            ...paramSettings,
            parameterToVary: "C",
            numberOfRuns: 10
        };
        const wrapper = await getWrapper();
        const editParams = wrapper.findComponent(EditParamSettings);
        editParams.vm.$emit("update", updatedSettings);
        await wrapper.find("#ok-settings").trigger("click");
        expect(mockSetParamSettings).toHaveBeenCalledTimes(1);
        expect(mockSetParamSettings.mock.calls[0][1]).toStrictEqual(updatedSettings);
        expect(wrapper.emitted("close")?.length).toBe(1);
    });

    it("disables and enables button as expected when batchParsError changes", async () => {
        const wrapper = await getWrapper();
        const editParams = wrapper.findComponent(EditParamSettings);
        editParams.vm.$emit("batchParsErrorChange", { error: "test error" });
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(true);
        editParams.vm.$emit("batchParsErrorChange", null);
        await nextTick();
        expect((wrapper.find("#ok-settings").element as HTMLButtonElement).disabled).toBe(false);
    });
});