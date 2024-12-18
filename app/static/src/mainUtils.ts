import { AppType } from "./store/appState/state";
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
