import { AppState } from "@/store/appState/state";
import { ActionContext } from "vuex";

export type Dict<V> = { [k: string]: V };

export type AppCtx<S> = ActionContext<S, AppState>;
