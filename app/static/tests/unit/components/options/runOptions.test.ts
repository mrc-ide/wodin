import Vuex from "vuex";
import {BasicState} from "../../../../src/app/store/basic/state";
import {shallowMount} from "@vue/test-utils";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";

describe("RunOptions", () => {
    const getWrapper = (mockSetEndTime = jest.fn()) => {
        const store = new Vuex.Store<BasicState>({
            state: {} as any,
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        endTime: 99
                    },
                    mutations: {
                        SetEndTime: mockSetEndTime
                    }
                }
            }
        });
        return shallowMount(RunOptions, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("label").text()).toBe("End time");
        const input = wrapper.find("input");
        expect(input.attributes("type")).toBe("number");
        expect(input.attributes("min")).toBe("1");
        expect((input.element as HTMLInputElement).value).toBe("99");
    });

    it("commits end time change", () => {
        const mockSetEndTime = jest.fn();
        const wrapper = getWrapper(mockSetEndTime);
        const input = wrapper.find("input");
        input.setValue("101");
        expect(mockSetEndTime).toHaveBeenCalledTimes(1);
        expect(mockSetEndTime.mock.calls[0][1]).toBe(101);
    });
});
