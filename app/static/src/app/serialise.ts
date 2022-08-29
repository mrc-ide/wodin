import { AppState } from "./store/appState/state";

export const serialiseState = (state: AppState) => {
    return JSON.stringify({value: "PLACEHOLDER"});
};
