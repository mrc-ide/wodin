import { createApp } from "vue";
import { Store, StoreOptions } from "vuex";
import axios from "axios";
import "./scss/style.scss"
import { AppConfig, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde } from "./types/responseTypes";
import { AppState, AppType } from "./store/appState/state";
import { AppStateMutation } from "./store/appState/mutations";
import { ModelMutation } from "./store/model/mutations";
import { RunAction } from "./store/run/actions";
import { ModelAction } from "./store/model/actions";
import { getStoreOptions } from "./mainUtils";
import { mountScriptTags } from "./externalScriptSrc";
import RunTab from "./components/run/RunTab.vue";
import SensitivityTab from "./components/sensitivity/SensitivityTab.vue";

declare let odinjs: OdinRunnerOde
declare let dust: OdinRunnerDiscrete

const blockingScripts = ["./stores/runnerOde.js", "./stores/runnerDiscrete.js"];

const deepCopyStateIfExists = <T extends { state?: unknown }>(obj: T) => {
    if (obj.state) obj.state = JSON.parse(JSON.stringify(obj.state));
}

const componentsAndSelectors = (s: string) => ([
    { selector: `.w-run-graph[data-w-store="${s}"]`, component: RunTab },
    { selector: `.w-sens-graph[data-w-store="${s}"]`, component: SensitivityTab }
]);

const boot = async () => {
    // inject external scripts
    mountScriptTags();

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

    // find all stores the user has put in the page
    const stores = document.querySelectorAll("[data-w-store]")!;
    const storesInPage: string[] = []
    stores.forEach(el => {
        const elStore = el.getAttribute("data-w-store")!;
        if (!storesInPage.includes(elStore)) {
            storesInPage.push(elStore);
        }
    });

    // get relevant store configs and model code
    const configPromises = storesInPage.map(s => axios.get(`./stores/${s}/config.json`));
    const modelResponsePromises = storesInPage.map(s => axios.get(`./stores/${s}/model.json`));
    const configs = (await Promise.all(configPromises)).map(res => res.data) as { appType: AppType, defaultCode: string[] }[];
    const modelResponses = (await Promise.all(modelResponsePromises)).map(res => res.data) as OdinModelResponse[];

    storesInPage.forEach(async (s, i) => {
        const { appType, defaultCode } = configs[i];
        const modelResponse = modelResponses[i];
        const originalStore = getStoreOptions(appType) as StoreOptions<AppState>;

        // recursively deep copy state because without this we would have multiple
        // stores writing to the same state objects
        const deepCopyStore = { ...originalStore };
        deepCopyStateIfExists(deepCopyStore);
        Object.keys(deepCopyStore.modules!).forEach(m => deepCopyStateIfExists(deepCopyStore.modules![m]));

        const store = new Store(deepCopyStore);

        // manually initialise store
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

        // mount components to dom elements based on selectors
        componentsAndSelectors(s).forEach(({ component, selector }) => {
            const applet = createApp(component);
            applet.use(store);
            document.querySelectorAll(selector)?.forEach(el => applet.mount(el));
        });
    })
};

boot()
