import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import ErrorsAlert from "../../../src/app/components/ErrorsAlert.vue";
import { APIError } from "../../../src/app/types/responseTypes";
import { ErrorsMutation } from "../../../src/app/store/errors/mutations";

describe("ErrorsAlert", () => {
    const getWrapper = (errors: APIError[], dismissErrors = jest.fn()) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState,
            modules: {
                errors: {
                    namespaced: true,
                    state: {
                        errors
                    },
                    mutations: {
                        [ErrorsMutation.DismissErrors]: dismissErrors
                    }
                }
            }
        });
        return shallowMount(ErrorsAlert, {
            global: {
                plugins: [store]
            }
        });
    };

    it("renders as expected with no errors", () => {
        const wrapper = getWrapper([]);
        expect(wrapper.find(".alert").exists()).toBe(false);
    });

    it("renders as expected with one error", () => {
        const wrapper = getWrapper([{ error: "TEST_CODE", detail: "Test Error Message" }]);
        const alert = wrapper.find(".alert");
        expect(alert.classes()).toStrictEqual(["alert", "alert-danger", "alert-dismissible", "fade", "show"]);
        expect(alert.attributes("role")).toBe("alert");
        expect(alert.find("strong").text()).toBe("An error occurred:");
        const listItems = alert.findAll("ul li");
        expect(listItems.length).toBe(1);
        expect(listItems.at(0)?.text()).toBe("Test Error Message");

        const closeButton = alert.find("button");
        expect(closeButton.classes()).toStrictEqual(["close"]);
        expect(closeButton.attributes("aria-label")).toBe("Close");
        expect(closeButton.text()).toBe("×");
    });

    it("renders as expected with multiple errors", () => {
        const wrapper = getWrapper([
            { error: "TEST_CODE", detail: "Test Error Message" },
            { error: "OTHER_CODE", detail: null }
        ]);
        const alert = wrapper.find(".alert");
        expect(alert.find("strong").text()).toBe("Errors occurred:");
        const listItems = alert.findAll("ul li");
        expect(listItems.length).toBe(2);
        expect(listItems.at(0)?.text()).toBe("Test Error Message");
        expect(listItems.at(1)?.text()).toBe("OTHER_CODE");
    });

    it("dismisses errors on close", async () => {
        const mockDismissErrors = jest.fn();
        const wrapper = getWrapper([{ error: "TEST_CODE", detail: "Test Error Message" }], mockDismissErrors);
        const closeButton = wrapper.find("button");
        await closeButton.trigger("click");
        expect(mockDismissErrors).toHaveBeenCalled();
    });
});
