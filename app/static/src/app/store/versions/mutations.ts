import { MutationTree } from "vuex";
import { VersionsState } from "./state";
import { Versions } from "../../types/responseTypes";

export const enum VersionsMutation {
  SetVersions = "SetVersions"
}

export const mutations: MutationTree<VersionsState> = {
  [VersionsMutation.SetVersions](state: VersionsState, payload: Versions) {
    state.versions = payload;
  }
};
