import { ActionContext } from "vuex";

export type Dict<V> = { [k: string]: V };

 
export type AppCtx = ActionContext<any, any>;
