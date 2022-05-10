import * as dopri from "dopri";
import { ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { RunModelPayload } from "../../types/actionPayloadTypes";
import { ErrorsMutation } from "../errors/mutations";
import { OdinModelResponse } from "../../types/responseTypes";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    RunModel = "RunModel"
}

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinRunner(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdinRunner)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<string>("/odin/runner");
    },

    async FetchOdin(context) {
        const odinCode = {
            model: [
                "deriv(y1) <- sigma * (y2 - y1)",
                "deriv(y2) <- R * y1 - y2 - y1 * y3",
                "deriv(y3) <- -b * y3 + y1 * y2",
                "initial(y1) <- 10.0",
                "initial(y2) <- 1.0",
                "initial(y3) <- 1.0",
                "sigma <- 10.0",
                "R     <- 28.0",
                "b     <-  8.0 / 3.0"
            ]
        };

        await api(context)
            .withSuccess(ModelMutation.SetOdin)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .post<OdinModelResponse>("/odin/model", odinCode);
    },

    RunModel(context, payload: RunModelPayload) {
        const { state, commit } = context;
        if (state.odinRunner && state.odin) {
            const {
                parameters, start, end, control
            } = payload;

            const solution = state.odinRunner(dopri.Dopri, state.odin, parameters, start, end, control);
            commit(ModelMutation.SetOdinSolution, solution);
        }
    }
};
