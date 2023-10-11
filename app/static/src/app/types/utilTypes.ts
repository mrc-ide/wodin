import { ActionContext } from "vuex";

export type Dict<V> = { [k: string]: V }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppCtx = ActionContext<any, any>;
