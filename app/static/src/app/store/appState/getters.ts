import { Getter, GetterTree } from "vuex";
import { AppState } from "./state";

export enum AppStateGetter {
  baseUrlPath = "baseUrlPath"
}

export interface AppStateGetters {
  [AppStateGetter.baseUrlPath]: Getter<AppState, AppState>;
}

export const getters: AppStateGetters & GetterTree<AppState, AppState> = {
  [AppStateGetter.baseUrlPath]: (state: AppState): string => {
    return new URL(state.baseUrl!).pathname.replace(/^\//, "");
  }
};
