import {mount} from "@vue/test-utils";
import Vuex, {Store} from "vuex";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import LinkData from "../../../../src/app/components/options/LinkData.vue";
import {BasicState} from "../../../../src/app/store/basic/state";
import {FitState} from "../../../../src/app/store/fit/state";
import {AppType, VisualisationTab} from "../../../../src/app/store/appState/state";
import SensitivityOptions from "../../../../src/app/components/options/SensitivityOptions.vue";

describe("OptionsTab", () => {
    const getWrapper = (store: Store<any>) =>
    {
        return mount(OptionsTab, {
            global: {
                plugins: [store]
            }
        });
    };

    const fitAppState = {
            appType: AppType.Fit,
            openVisualisationTab: VisualisationTab.Run,
            model: {
                parameterValues: new Map<string, number>()
            },
            modelFit: {
                paramsToVary: []
            },
            sensitivity:{
                paramSettings: {}
            }
        } as any;


    it("renders as expected for Basic app", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                appType: AppType.Basic,
                model: {
                    parameterValues: null
                }
            } as any
        });
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(2);
        expect(collapses.at(0)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(0)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(0)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Run Options");
        expect(collapses.at(1)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(1)!.findComponent(RunOptions).exists()).toBe(true);
    });

    it("renders as expected for Fit app", () => {
        const store = new Vuex.Store<FitState>({state: fitAppState});
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.length).toBe(3);
        expect(collapses.at(0)!.props("title")).toBe("Link");
        expect(collapses.at(0)!.props("collapseId")).toBe("link-data");
        expect(collapses.at(0)!.findComponent(LinkData).exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(1)!.props("collapseId")).toBe("model-params");
        const paramValues = collapses.at(1)!.findComponent(ParameterValues);
        expect(paramValues.exists()).toBe(true);
        expect(collapses.at(2)!.props("title")).toBe("Run Options");
        expect(collapses.at(2)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(2)!.findComponent(RunOptions).exists()).toBe(true);
    });

    it("renders as expected when sensitivity tab is not open", () => {
        const store = new Vuex.Store<FitState>({state: fitAppState});
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.at(0)!.props("collapseOn")).toBe(false);
        expect(collapses.at(1)!.props("collapseOn")).toBe(false);
        expect(collapses.at(2)!.props("collapseOn")).toBe(false);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(false);
    });

    it("renders as expected when sensitivity tab is open", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                ...fitAppState,
                openVisualisationTab: VisualisationTab.Sensitivity
            }
        });
        const wrapper = getWrapper(store);
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.at(0)!.props("collapseOn")).toBe(true);
        expect(collapses.at(1)!.props("collapseOn")).toBe(true);
        expect(collapses.at(2)!.props("collapseOn")).toBe(true);
        expect(wrapper.findComponent(SensitivityOptions).exists()).toBe(true);
    });
});
