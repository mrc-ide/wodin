import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import DataTab from "../../../../src/app/components/data/DataTab.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import {mockFitDataState, mockFitState} from "../../../mocks";
import { FitState } from "../../../../src/app/store/fit/state";
import {FitDataState} from "../../../../src/app/store/fitData/state";

describe("Data Tab", () => {
    const getWrapper = (
        state: Partial<FitDataState> = {},
        mockUpload = jest.fn(),
        mockSetTimeVariable = jest.fn()
    ) => {
        const store = new Vuex.Store<FitState>({
            state: mockFitState(),
            modules: {
                fitData: {
                    namespaced: true,
                    state: mockFitDataState(state),
                    actions: {
                        Upload: mockUpload
                    },
                    mutations: {
                        SetTimeVariable: mockSetTimeVariable
                    }
                }
            }
        });
        return shallowMount(DataTab, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected before upload", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h3").text()).toBe("Upload data");
        expect(wrapper.find("input").attributes("type")).toBe("file");
        expect(wrapper.find("input").attributes("accept")).toBe(".csv,.txt");
        expect(wrapper.find("#data-upload-success").exists()).toBe(false);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toBe(null);
        expect(wrapper.find("#time-variable").exists()).toBe(false);
    });

    it("renders as expected on successful upload", () => {
        const data = [{ a: 1, b: 2, c: 3 }, { a: 2, b: 3, c: -4 }];
        const columns = ["a", "b", "c"];
        const timeVariableCandidates = ["a", "b"];
        const timeVariable = "b";
        const wrapper = getWrapper({data, columns, timeVariableCandidates, timeVariable});
        expect(wrapper.find("#data-upload-success").text()).toBe("Uploaded 2 rows and 3 columns");
        expect(wrapper.findComponent(VueFeather).props("type")).toBe("check");
        const select = wrapper.find("#time-variable select");
        expect(select.attributes("id")).toBe("select-time-variable");
        expect((select.element as HTMLSelectElement).value).toBe("b");
        const options = select.findAll("option");
        expect(options.length).toBe(2);
        expect(options.at(0)!.text()).toBe("a");
        expect((options.at(0)!.element as HTMLOptionElement).value).toBe("a");
        expect(options.at(1)!.text()).toBe("b");
        expect((options.at(1)!.element as HTMLOptionElement).value).toBe("b");
    });

    it("renders as expected on error", () => {
        const error = { error: "TEST ERROR", detail: "TEST DETAIL" };
        const wrapper = getWrapper({error});
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
        expect(wrapper.find("#time-variable").exists()).toBe(false);
    });

    it("dispatches upload action", async () => {
        const mockUpload = jest.fn();
        const wrapper = getWrapper({}, mockUpload);
        const mockFile = { name: "testFile.csv" };

        const input = wrapper.find("input");
        Object.defineProperty(input.element, "files", {
            get: jest.fn().mockReturnValue([mockFile])
        });
        await input.trigger("change");
        expect(mockUpload).toHaveBeenCalledTimes(1);
        expect(mockUpload.mock.calls[0][1]).toBe(mockFile);
    });

    it("commits SetTimeVariable when select changes", async () => {
        const data = [{ a: 1, b: 2, c: 3 }, { a: 2, b: 3, c: -4 }];
        const columns = ["a", "b", "c"];
        const timeVariableCandidates = ["a", "b"];
        const timeVariable = "b";
        const mockSetTimeVar = jest.fn();
        const wrapper = getWrapper({data, columns, timeVariableCandidates, timeVariable}, jest.fn(), mockSetTimeVar);

        const select = wrapper.find("#time-variable select");
        (select.element as HTMLSelectElement).value = "a";
        await select.trigger("change");

        expect(mockSetTimeVar).toHaveBeenCalledTimes(1);
        expect(mockSetTimeVar.mock.calls[0][1]).toBe("a");
    });
});
