import { ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { RunModelPayload } from "../../types/actionPayloadTypes";
import { ErrorsMutation } from "../errors/mutations";

export enum ModelAction {
    FetchOdinUtils = "FetchOdinUtils",
    FetchOdin = "FetchOdin",
    RunModel = "RunModel"
}

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinUtils(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdinUtils)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .getScript<string>("/odin/utils");
    },

    async FetchOdin(context) {
        const odinCode = `"model": [
        "deriv(y1) <- sigma * (y2 - y1)",
        "deriv(y2) <- R * y1 - y2 - y1 * y3",
        "deriv(y3) <- -b * y3 + y1 * y2",
        "initial(y1) <- 10.0",
        "initial(y2) <- 1.0",
        "initial(y3) <- 1.0",
        "sigma <- 10.0",
        "R     <- 28.0",
        "b     <-  8.0 / 3.0"
    ]`;

        await api(context)
            .withSuccess(ModelMutation.SetOdin)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .getScript<string>("/odin/model", odinCode);
    },

    RunModel(context, payload: RunModelPayload) {
        const { state, commit } = context;
        if (state.odinUtils && state.odin) {
            const { parameters, end, points } = payload;

            const { runner } = state.odinUtils;
            const solution = runner.runModel(parameters, end, points, state.odin);
            commit(ModelMutation.SetOdinSolution, solution);
        }
    }
};
