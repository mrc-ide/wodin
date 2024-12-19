import axios from "axios";
import RunTab from "./components/run/RunTab.vue";
import SensitivityTab from "./components/sensitivity/SensitivityTab.vue";
import { AppState, AppType } from "./store/appState/state";
import { AppConfig, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde } from "./types/responseTypes";
import { Store, StoreOptions } from "vuex";
import { AppStateMutation } from "./store/appState/mutations";
import { ModelMutation } from "./store/model/mutations";
import { ModelAction } from "./store/model/actions";
import { RunAction } from "./store/run/actions";
import { storeOptions as basicStoreOptions } from "./store/basic/basic";
import { storeOptions as fitStoreOptions } from "./store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "./store/stochastic/stochastic";

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
    { selector: `.w-run-graph[data-w-store="${s}"]`, component: RunTab },
    { selector: `.w-sens-graph[data-w-store="${s}"]`, component: SensitivityTab }
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

export const getConfigsAndModels = async (storesInPage: string[]) => {
    const configPromises = storesInPage.map(s => axios.get(`./stores/${s}/config.json`));
    const modelResponsePromises = storesInPage.map(s => axios.get(`./stores/${s}/model.json`));
    const configs = (await Promise.all(configPromises)).map(res => res.data) as { appType: AppType, defaultCode: string[] }[];
    const modelResponses = (await Promise.all(modelResponsePromises)).map(res => res.data) as OdinModelResponse[];
    return { configs, modelResponses };
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

export const initialiseStore = async (
    store: Store<AppState>, appType: AppType,
    defaultCode: string[], modelResponse: OdinModelResponse
) => {
    const appConfigPayload = {
        appType,
        basicProp: "",
        defaultCode,
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
