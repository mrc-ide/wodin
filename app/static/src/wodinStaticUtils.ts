import axios from "axios";
import RunTab from "./components/run/RunTab.vue";
import SensitivityTab from "./components/sensitivity/SensitivityTab.vue";
import WodinPlot from "./components/WodinPlot.vue";
import { AppState, AppType, VisualisationTab } from "./store/appState/state";
import { AppConfig, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde } from "./types/responseTypes";
import { Store, StoreOptions } from "vuex";
import { AppStateMutation } from "./store/appState/mutations";
import { ModelMutation } from "./store/model/mutations";
import { ModelAction } from "./store/model/actions";
import { storeOptions as basicStoreOptions } from "./store/basic/basic";
import { storeOptions as fitStoreOptions } from "./store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "./store/stochastic/stochastic";
import ParameterSlider from "./componentsStatic/ParameterSlider.vue";
import { registerRerunModel, registerRerunSensitivity } from "./store/plugins";
import { RunMutation } from "./store/run/mutations";
import { ComponentProps } from "../tests/testUtils";
import { GraphsMutation, UpdateConfigGroupPayload, UpdateConfigPayload, UpdateGraphGroupPayload } from "./store/graphs/mutations";
import { DataType, SyncProperty } from "./store/graphs/state";
import { newUid } from "./utils";
import { createApp } from "vue";

const { Basic, Fit, Stochastic } = AppType;
export const getStoreOptions = (appType: AppType) => {
    switch (appType) {
        case Basic:
            return basicStoreOptions;
        case Fit:
            return fitStoreOptions;
        case Stochastic:
            return stochasticStoreOptions;
        default:
            throw new Error("Unknown app type");
    }
};

export const componentsAndSelectors = (s: string) => ([
    { selector: `.w-run-graph[data-w-store="${s}"]`, component: RunTab, tab: VisualisationTab.Run },
    { selector: `.w-sens-graph[data-w-store="${s}"]`, component: SensitivityTab, tab: VisualisationTab.Sensitivity },
    { selector: `.w-par[data-w-store="${s}"]`, component: ParameterSlider }
]);

export const waitForBlockingScripts = async (blockingScripts: string[]) => {
    // inject internal runner scripts
    let numScriptsLoaded = 0;
    blockingScripts.forEach(src => {
        const script = document.createElement("script");
        script.async = false;
        script.src = src;
        document.body.append(script);
        script.onload = () => numScriptsLoaded++;
    });

    // wait for runner scripts to load (waiting for correct number of
    // onload events from script tags above)
    await new Promise(res => setInterval(() => {
        if (numScriptsLoaded === blockingScripts.length) return res(null)
    }, 100));
};

export const getStoresInPage = () => {
    const stores = document.querySelectorAll("[data-w-store]")!;
    const storeTypesInPage: string[] = []
    const storesInPage: string[] = []
    stores.forEach(el => {
        const elStore = el.getAttribute("data-w-store")!;
        const storeType = elStore.split(":")[0];
        if (!storesInPage.includes(elStore)) storesInPage.push(elStore);
        if (!storeTypesInPage.includes(storeType)) storeTypesInPage.push(storeType);
    });
    return { storesInPage, storeTypesInPage };
};

// TODO more tolerant error handling, maybe one config didnt work (for error handling PR)
export type StaticConfig = {
  appType: AppType,
  defaultCode: string[],
  endTime?: number,
  static: {
    // actually parameterValues can have number[] as value in object but wodin type
    // don't like that so we lie a little
    parameterValues: Record<string, number>,
    dt?: number,
    nParticles?: number,
    legend: Record<string, { label: string, color: string }>
  }
};
type ConfigAndModel = { config: StaticConfig, modelResponse: OdinModelResponse };

export const getConfigAndModelForStores = async (storesInPage: string[]) => {
    const configPromises = storesInPage.map(s => axios.get(`./stores/${s}/config.json`));
    const modelResponsePromises = storesInPage.map(s => axios.get(`./stores/${s}/model.json`));
    const configs = (await Promise.all(configPromises)).map(res => res.data) as StaticConfig[];
    const modelResponses = (await Promise.all(modelResponsePromises)).map(res => res.data) as OdinModelResponse[];

    return Object.fromEntries(storesInPage.map((s, i) => {
        const cfgAndModel: ConfigAndModel = {
            config: configs[i],
            modelResponse: modelResponses[i]
        };
        return [ s, cfgAndModel ];
    }));
};

export const getDeepCopiedStoreOptions = (storeOptions: StoreOptions<AppState>) => {
    const deepCopy = { ...storeOptions };
    if (deepCopy.state) {
        deepCopy.state = JSON.parse(JSON.stringify(deepCopy.state));
    }
    deepCopy.modules = { ...deepCopy.modules };
    Object.keys(deepCopy.modules!).forEach(m => {
        deepCopy.modules![m] = { ...deepCopy.modules![m] };
        if (deepCopy.modules![m].state) {
            deepCopy.modules![m].state = JSON.parse(JSON.stringify(deepCopy.modules![m].state));
        }
    });
    return deepCopy;
};

declare let odinjs: OdinRunnerOde
declare let dust: OdinRunnerDiscrete

/*
    Traditionally in dynamic wodin, initialising the store is the responsibility
    of the components on mount (such as WodinSession initialising the app config)
    however, we do not mount these components anymore in static wodin. Static wodin
    may or may not mount these components so we need to guarantee that these bits
    of state are initialised.

    Note: we have not thoroughly explored mounting components that impact these
    specific parts of the store yet as there is no need to in static wodin. In theory
    we have disabled the API service so they should not change the state but if you
    are getting API related errors on static build then it returning undefined as the
    response may be the cause.
*/
export const initialiseStore = async (
    store: Store<AppState>, config: Partial<StaticConfig>, modelResponse: OdinModelResponse
) => {
    const appConfigPayload = {
        appType: config.appType,
        basicProp: "",
        defaultCode: config.defaultCode,
        endTime: config.endTime || 100,
        readOnlyCode: true,
        stateUploadIntervalMillis: 2_000_000,
        maxReplicatesRun: 100,
        maxReplicatesDisplay: 50
    } as AppConfig
    store.commit(AppStateMutation.SetConfig, appConfigPayload);
    store.commit(`run/${RunMutation.SetEndTime}`, config.endTime || 100);
    store.commit(`model/${ModelMutation.SetOdinRunnerOde}`, odinjs);
    store.commit(`model/${ModelMutation.SetOdinRunnerDiscrete}`, dust);
    store.commit(`model/${ModelMutation.SetOdinResponse}`, modelResponse);
    await store.dispatch(`model/${ModelAction.CompileModel}`)
    if (config.static?.parameterValues) {
      store.commit(`run/${RunMutation.SetParameterValues}`, config.static.parameterValues);
    }
    store.commit(`run/${RunMutation.SetStatic}`, config.static || {});
};

export const registerRedrawGraphPlugins = (storeName: string, store: Store<AppState>) => {
    // add tab to visible tab if it is included in the document
    const visibleTabs = componentsAndSelectors(storeName).reduce((tabs, { selector, tab }) => {
        if (tab && document.querySelector(selector)) {
            return [ ...tabs, tab ];
        }
        return tabs;
    }, [] as VisualisationTab[]);

    // add appropriate store subscribers for whatever tabs are visible on the page
    visibleTabs.forEach(async tab => {
        if (tab === VisualisationTab.Run) {
            registerRerunModel(store);
        } else if (tab === VisualisationTab.Sensitivity) {
            registerRerunSensitivity(store);
        }
    });
};

type GraphIds = {
  id: string,
  userId: string | null
}[]

const throwIfAttributeNull = (attr: Attr, el: Element) => {
  if (attr.nodeValue === null) {
    throw new Error(`You must define ${attr.nodeName} for ${el}`);
  }
};

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const drawParameters = (storeName: string, store: Store<AppState>) => {
  const paramSliderDivs = document.querySelectorAll(`.w-par[data-w-store="${storeName}"]`);

  paramSliderDivs.forEach(el => {
    const props: Writeable<Partial<ComponentProps<typeof ParameterSlider>>> = {}
    for (let i = 0; i < el.attributes.length; i++) {
      const attribute = el.attributes[i];
      if (attribute.nodeName === "w-par") {
        throwIfAttributeNull(attribute, el);
        props.par = attribute.nodeValue!;
      } else if (attribute.nodeName === "w-min") {
        throwIfAttributeNull(attribute, el);
        props.min = parseFloat(attribute.nodeValue!);
      } else if (attribute.nodeName === "w-max") {
        throwIfAttributeNull(attribute, el);
        props.max = parseFloat(attribute.nodeValue!);
      } else if (attribute.nodeName === "w-title") {
        throwIfAttributeNull(attribute, el);
        props.title = attribute.nodeValue!;
      }
    }

    const applet = createApp(ParameterSlider, props as any);
    applet.use(store);
    applet.mount(el);
  });
};

export const setUpGraphsStateAndDrawGraphs = (storeName: string, store: Store<AppState>) => {
  const graphDivs = document.querySelectorAll(`.w-graph[data-w-store="${storeName}"]`);

  // initialise with all configs ids
  const graphIds: GraphIds = [];
  graphDivs?.forEach(el => {
    let userId: string | null = null;
    for (let i = 0; i < el.attributes.length; i++) {
      const attribute = el.attributes[i];
      if (attribute.nodeName !== "w-id") continue;
      throwIfAttributeNull(attribute, el);
      userId = attribute.nodeValue;
      break;
    }

    let id: string;
    const matchingGraphId = graphIds.find(gId => gId.userId === userId);
    if (!matchingGraphId) {
      id = newUid();
    } else {
      id = matchingGraphId.id;
    }

    store.commit(`graphs/${GraphsMutation.AddConfig}`, id);

    graphIds.push({ id, userId });
  });

  // construct all configs properties
  graphDivs?.forEach((el, index) => {
    const { id } = graphIds[index];
    const updateConfigPayload: UpdateConfigPayload = { id, value: {} };

    for (let i = 0; i < el.attributes.length; i++) {
      const attribute = el.attributes[i];
      if (attribute.nodeName === "w-vars") {
        const variables = attribute.nodeValue!.split(",");
        updateConfigPayload.value.selectedVariables = variables;
      } else if (attribute.nodeName === "w-log-y") {
        updateConfigPayload.value.logScaleYAxis = true;
      }
    }

    store.commit(`graphs/${GraphsMutation.UpdateConfig}`, updateConfigPayload);
  });


  const configGroups = document.querySelectorAll(`.w-sync-graphs[data-w-store="${storeName}"]`);

  configGroups?.forEach(el => {
    let userIds: string[] | null = null;
    let syncProperties: SyncProperty[] | null = null;
    for (let i = 0; i < el.attributes.length; i++) {
      const attribute = el.attributes[i];
      if (attribute.nodeName === "w-graph-ids") {
        throwIfAttributeNull(attribute, el);
        // TODO need to do validation, do these exist?
        userIds = attribute.nodeValue!.split(",");
      } else if (attribute.nodeName === "w-sync-properties") {
        throwIfAttributeNull(attribute, el);
        // TODO need to do validation, are these correct?
        syncProperties = attribute.nodeValue!.split(",") as SyncProperty[];
      }
    }

    if (!userIds || !syncProperties) {
      throw new Error(`${el} must specify both w-graph-ids and w-sync-properties`);
    }

    // TODO validation, do these always exist?
    const configIds = userIds.map(userId => graphIds.find(gId => gId.userId === userId)!.id);
    const updateConfigGroupPayload: UpdateConfigGroupPayload = {
      id: newUid(),
      value: { configIds, syncProperties }
    };
    store.commit(`graphs/${GraphsMutation.UpdateConfigGroup}`, updateConfigGroupPayload);
  });


  const dataTypeToIds: Record<string, string[]> = {};
  const dataTypes: DataType[] = [];
  graphDivs?.forEach((el, index) => {
    let dType: DataType | null = null;
    for (let i = 0; i < el.attributes.length; i++) {
      const attribute = el.attributes[i];
      if (attribute.nodeName === "w-type") {
        throwIfAttributeNull(attribute, el);
        // TODO need to do validation, is it a data type?
        dType = attribute.nodeValue! as DataType;
      }
    }
    if (!dType) {
      throw new Error(`You must define w-type for graph: ${el}`);
    }
    dataTypes.push(dType);
    dataTypeToIds[dType] ??= [];
    dataTypeToIds[dType].push(graphIds[index].id);
  });

  Object.entries(dataTypeToIds).forEach(([dataTypeStr, configIds]) => {
    const dataType = dataTypeStr as DataType;
    const updateGraphGroupPayload: UpdateGraphGroupPayload = {
      id: newUid(),
      value: { configIds, dataType }
    };
    store.commit(`graphs/${GraphsMutation.UpdateGraphGroup}`, updateGraphGroupPayload);
  });

  const graphGroupIds = Object.keys(store.state.graphs.graphGroups);
  store.commit(`graphs/${GraphsMutation.UpdateVisibleGraphGroups}`, graphGroupIds);

  graphDivs?.forEach((el, index) => {
    const { id } = graphIds[index];
    const dataType = dataTypes[index];
    const [graphGroupId] = Object.entries(store.state.graphs.graphGroups).find(([_, group]) => group.dataType === dataType)!;
    const wodinPlotProps: ComponentProps<typeof WodinPlot> = {
      configId: id, graphGroupId, fadePlot: false
    };
    const applet = createApp(WodinPlot, wodinPlotProps);
    applet.use(store);
    applet.mount(el);
  });
};
