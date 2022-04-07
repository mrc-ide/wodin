// Mock the import of plotly so we can mock Plotly methods
import mock = jest.mock;

jest.mock("plotly.js", () => ({}));
/* eslint-disable import/first */
import {shallowMount} from "@vue/test-utils";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";
import { nextTick } from "vue";
import Vuex from "vuex";
import {BasicState} from "../../../../src/app/store/basic/state";
import {ModelMutation, mutations} from "../../../../src/app/store/model/mutations";
import {mockBasicState, mockModelState} from "../../../mocks";

describe("RunModelPlot", () => {
    const getStore = (odinUtils = null, mockRunModel = jest.fn) => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinUtils
                    }),
                    actions: {
                        RunModel: mockRunModel
                    },
                    mutations
                }
            }
        });
    };

    const getWrapper = (store = getStore()) => {
        return shallowMount(RunModelPlot,{
            global: {
                plugins: [store]
            }
        });
    };

    it("renders plot ref element", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.run-model-plot");
        expect(div.exists()).toBe(true);
        expect((wrapper.vm as any).plot).toBe(div.element);
    });

    const expectedRunModelPayload = {
        parameters: {},
        end: 100,
        points: 1000
    };

    it("runs model when odin is updated, if odin utils are set", async () => {
        const mockUtils = {} as any;
        const mockRunModel = jest.fn();
        const store = getStore(mockUtils, mockRunModel);
        getWrapper(store);

        store.commit({type: `model/${ModelMutation.SetOdin}`, payload: {} as any});
        await nextTick();
        expect(mockRunModel).toHaveBeenCalled();
        const payload = mockRunModel.mock.calls[0][1];
        expect(payload).toStrictEqual(expectedRunModelPayload);
    });

    it("does not run model when odin is updated, if odin utils are not set", async () => {
        const mockRunModel = jest.fn();
        const store = getStore(null, mockRunModel);
        getWrapper(store);

        store.commit({type: `model/${ModelMutation.SetOdin}`, payload: {} as any});
        await nextTick();
        expect(mockRunModel).not.toHaveBeenCalled();
    });
});
