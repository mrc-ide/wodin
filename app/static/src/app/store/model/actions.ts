import {ActionContext, ActionTree} from "vuex";
import {ModelState} from "./state";
import {api} from "../../apiService";
import {ModelMutation} from "./mutations";
import {AppState} from "../AppState";
import {RunModelPayload} from "../../actionPayloadTypes";

export enum ModelAction {
    FetchOdinUtils = "FetchOdinUtils",
    FetchOdin = "FetchOdin",
    RunModel = "RunModel"
}

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinUtils(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdinUtils) //TODO: Error case
            .getScript<string>(`/odin/utils`);
    },

    async FetchOdin(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdin) //TODO: Error case
            .getScript<string>(`/odin/model`);
    },

    async RunModel(context, payload: RunModelPayload) {
        const { state, commit } = context;
        if (state.odinUtils && state.odin) {
            const {parameters, end, points} = payload;

            console.log("Running model with utils: " + JSON.stringify(state.odinUtils));

            //TODO: This could be done in the mutation when we set these in the state
            const helpers = new (state.odinUtils.helpers as any)();
            const runner = new (state.odinUtils.runner as any)(helpers);

            const solution = runner.runModel(parameters, end, points, state.odin);
            commit({type: ModelMutation.SetOdinSolution, payload: solution})
        }
    }
};
