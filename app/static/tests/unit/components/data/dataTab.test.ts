import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import VueFeather from "vue-feather";
import DataTab from "../../../../src/app/components/data/DataTab.vue";
import ErrorInfo from "../../../../src/app/components/ErrorInfo.vue";
import { mockFitState } from "../../../mocks";
import { FitState } from "../../../../src/app/store/fit/state";
import { Dict } from "../../../../src/app/types/utilTypes";
import { Error } from "../../../../src/app/types/responseTypes";

describe("Data Tab", () => {
    const getWrapper = (
        error: Error | null = null,
        data: null | Dict<number>[] = null,
        columns: null | string[] = null,
        mockUpload = jest.fn()
    ) => {
        const store = new Vuex.Store<FitState>({
            state: mockFitState(),
            modules: {
                fitData: {
                    namespaced: true,
                    state: {
                        error,
                        data,
                        columns
                    },
                    actions: {
                        Upload: mockUpload
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
    });

    it("renders as expected on successful upload", () => {
        const wrapper = getWrapper(null, [{ a: 1, b: 2, c: 3 }, { a: 2, b: 3, c: 4 }], ["a", "b", "c"]);
        expect(wrapper.find("#data-upload-success").text()).toBe("Uploaded 2 rows and 3 columns");
        expect(wrapper.findComponent(VueFeather).props("type")).toBe("check");
    });

    it("renders as expected on error", () => {
        const error = { error: "TEST ERROR", detail: "TEST DETAIL" };
        const wrapper = getWrapper(error);
        expect(wrapper.findComponent(ErrorInfo).props("error")).toStrictEqual(error);
    });

    it("dispatches upload action", async () => {
        const mockUpload = jest.fn();
        const wrapper = getWrapper(null, null, null, mockUpload);
        const mockFile = { name: "testFile.csv" };

        const input = wrapper.find("input");
        Object.defineProperty(input.element, "files", {
            get: jest.fn().mockReturnValue([mockFile])
        });
        await input.trigger("change");
        expect(mockUpload).toHaveBeenCalledTimes(1);
        expect(mockUpload.mock.calls[0][1]).toBe(mockFile);
    });
});
