import { Module } from "vuex";
import { mutations } from "./mutations";
import { AppState } from "../appState/state";
import { ErrorsState } from "./state";

const defaultErrorsState: () => ErrorsState = () => {
  return {
    errors: []
  };
};

const namespaced = true;

export const errors: Module<ErrorsState, AppState> = {
  namespaced,
  state: defaultErrorsState(),
  mutations
};
