import { ActionContext } from "vuex";

export type Dict<V> = { [k: string]: V }

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppCtx = ActionContext<any, any>;
