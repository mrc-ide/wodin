import axios from "axios";
import RunTab from "./components/run/RunTab.vue";
import SensitivityTab from "./components/sensitivity/SensitivityTab.vue";
import { AppState, AppType, VisualisationTab } from "./store/appState/state";
import { AppConfig, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde } from "./types/responseTypes";
import { Store, StoreOptions } from "vuex";
import { AppStateMutation } from "./store/appState/mutations";
import { ModelMutation } from "./store/model/mutations";
import { ModelAction } from "./store/model/actions";
import { RunAction } from "./store/run/actions";
import { storeOptions as basicStoreOptions } from "./store/basic/basic";
import { storeOptions as fitStoreOptions } from "./store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "./store/stochastic/stochastic";
import ParameterControl from "./componentsStatic/ParameterControl.vue";

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
    { selector: `.w-par[data-w-store="${s}"]`, component: ParameterControl }
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
    const storesInPage: string[] = []
    stores.forEach(el => {
        const elStore = el.getAttribute("data-w-store")!;
        if (!storesInPage.includes(elStore)) {
            storesInPage.push(elStore);
        }
    });
    return storesInPage;
};

// TODO more tolerant error handling, maybe one config didnt work (for error handling PR)
export type StaticConfig = { appType: AppType, defaultCode: string[] };
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
    store: Store<AppState>, config: StaticConfig, modelResponse: OdinModelResponse
) => {
    const appConfigPayload = {
        appType: config.appType,
        basicProp: "",
        defaultCode: config.defaultCode,
        endTime: 100,
        readOnlyCode: true,
        stateUploadIntervalMillis: 2_000_000,
        maxReplicatesRun: 100,
        maxReplicatesDisplay: 50
    } as AppConfig
    store.commit(AppStateMutation.SetConfig, appConfigPayload);
    store.commit(`model/${ModelMutation.SetOdinRunnerOde}`, odinjs);
    store.commit(`model/${ModelMutation.SetOdinRunnerDiscrete}`, dust);
    store.commit(`model/${ModelMutation.SetOdinResponse}`, modelResponse);
    await store.dispatch(`model/${ModelAction.CompileModel}`)
    await store.dispatch(`run/${RunAction.RunModel}`)
};
