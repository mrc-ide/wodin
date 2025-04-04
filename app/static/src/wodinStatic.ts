import { createApp } from "vue";
import { getStoreOptions } from "./wodinStaticUtils";
import { Store, StoreOptions } from "vuex";
import "./scss/style.scss"
import { AppState } from "./store/appState/state";
import { loadThirdPartyCDNScripts } from "./externalScriptSrc";
import {
    componentsAndSelectors, getConfigAndModelForStores, getDeepCopiedStoreOptions,
    getStoresInPage, initialiseStore, waitForBlockingScripts
} from "./wodinStaticUtils";

/*
    This is the entrypoint to the wodin static build. This boot function just gets called
    at the end of the file. Since we are not allowed top level awaits we have to create
    an async function and call it at the bottom.

    To load any scripts that you need before the runs just append the src to the
    blockingScripts array.
*/

const blockingScripts = ["./stores/runnerOde.js", "./stores/runnerDiscrete.js"];

const boot = async () => {
    // inject external scripts such as mathjax
    loadThirdPartyCDNScripts();

    // wait for scripts we can't load without such as runner code
    await waitForBlockingScripts(blockingScripts);

    // find all stores the user has put in the page
    const storesInPage = getStoresInPage();

    // get relevant store configs and model code
    const configAndModelObj = await getConfigAndModelForStores(storesInPage);

    storesInPage.forEach(async s => {
        const { config, modelResponse } = configAndModelObj[s];
        const originalStoreOptions = getStoreOptions(config.appType) as StoreOptions<AppState>;

        // recursively deep copy state because without this we would have multiple
        // stores writing to the same state objects
        const store = new Store(getDeepCopiedStoreOptions(originalStoreOptions));

        // manually initialise store because this is the responsibility of apps like
        // WodinSession which aren't used in the static build
        await initialiseStore(store, config, modelResponse);

        // mount components to dom elements based on selectors
        componentsAndSelectors(s).forEach(({ component, selector }) => {
            document.querySelectorAll(selector)?.forEach(el => {
              const applet = createApp(component);
              applet.use(store);
              applet.mount(el)
            });
        });
    })
};

boot()
