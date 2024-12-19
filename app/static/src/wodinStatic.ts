import { createApp } from "vue";
import { getStoreOptions } from "./wodinStaticUtils";
import { Store, StoreOptions } from "vuex";
import "./scss/style.scss"
import { AppState } from "./store/appState/state";
import { mountScriptTags } from "./externalScriptSrc";
import {
    componentsAndSelectors, getConfigsAndModels, getDeepCopiedStoreOptions,
    getStoresInPage, initialiseStore, waitForBlockingScripts
} from "./wodinStaticUtils";

const blockingScripts = ["./stores/runnerOde.js", "./stores/runnerDiscrete.js"];

const boot = async () => {
    // inject external scripts such as mathjax
    mountScriptTags();

    // wait for scripts we can't load without such as runner code
    await waitForBlockingScripts(blockingScripts);

    // find all stores the user has put in the page
    const storesInPage = getStoresInPage();

    // get relevant store configs and model code
    const { configs, modelResponses } = await getConfigsAndModels(storesInPage);

    storesInPage.forEach(async (s, i) => {
        const { appType, defaultCode } = configs[i];
        const modelResponse = modelResponses[i];
        const originalStoreOptions = getStoreOptions(appType) as StoreOptions<AppState>;

        // recursively deep copy state because without this we would have multiple
        // stores writing to the same state objects
        const store = new Store(getDeepCopiedStoreOptions(originalStoreOptions));

        // manually initialise store because this is the responsibility of apps like
        // WodinSession which aren't used in the static build
        await initialiseStore(store, appType, defaultCode, modelResponse);

        // mount components to dom elements based on selectors
        componentsAndSelectors(s).forEach(({ component, selector }) => {
            const applet = createApp(component);
            applet.use(store);
            document.querySelectorAll(selector)?.forEach(el => applet.mount(el));
        });
    })
};

boot()
