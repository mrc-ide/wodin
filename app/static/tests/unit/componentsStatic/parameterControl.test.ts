import ParameterControl from "@/componentsStatic/ParameterControl.vue";
import { BasicState } from "@/store/basic/state";
import { RunAction } from "@/store/run/actions";
import { shallowMount } from "@vue/test-utils";
import { mockBasicState, mockModelState, mockRunState } from "../../mocks";
import Vuex from "vuex";
import { RunMutation } from "@/store/run/mutations";

describe("Parameter Control", () => {
    const mockRunModel = vi.fn();
    const mockSetParameterValues = vi.fn();

    type ParameterControlProps = Parameters<NonNullable<(typeof ParameterControl)["setup"]>>["0"]
    const getWrapper = (props?: Partial<ParameterControlProps>) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                },
                run: {
                    namespaced: true,
                    state: mockRunState({ parameterValues: { a: 1, b: 2 } }),
                    mutations: {
                        [RunMutation.SetParameterValues]: mockSetParameterValues
                    },
                    actions: {
                        [RunAction.RunModel]: mockRunModel,
                    }
                }
            }
        });

        const defaultProps: ParameterControlProps = {
            name: "a",
            description: "test-desc",
            min: 0, max: 10, step: 100
        };

        return shallowMount(ParameterControl, {
            global: { plugins: [store] },
            props: { ...defaultProps, ...props }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const label = wrapper.find("#a-input");
        expect(label.text()).toBe("a");
        const description = wrapper.find("#a-description");
        expect(description.text()).toBe("test-desc");
        const input = wrapper.find("input");
        expect(input.element.classList[0]).toBe("form-range");
        expect(input.element.value).toBe("1");
        expect(mockRunModel).not.toBeCalled();
    });

    it("runs model when value changes", async () => {
        const wrapper = getWrapper();
        const input = wrapper.find("input");
        await input.setValue("10");
        expect(mockSetParameterValues.mock.calls[0][1]).toStrictEqual({ a: 10, b: 2 });
        expect(mockRunModel).toBeCalled();
    });
});
