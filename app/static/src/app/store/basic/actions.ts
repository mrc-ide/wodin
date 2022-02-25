import {ActionTree} from "vuex";
import {BasicState} from "./basic";
import {api} from "../../apiService";
import {BasicConfig} from "../../responseTypes";
import {BasicMutation} from "./mutations";

export enum BasicAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<BasicState, BasicState> = {
    async [BasicAction.FetchConfig](context, appName) {
        await api(context)
            .freezeResponse()
            .withSuccess(BasicMutation.SetConfig)
            .withError(BasicMutation.AddError)
            .get<BasicConfig>(`/config/basic/${appName}`)
    }
};
