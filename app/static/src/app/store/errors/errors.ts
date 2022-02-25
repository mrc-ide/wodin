import {APIError} from "../../responseTypes";
import {Module} from "vuex";
import {mutations} from "./mutations";
import {AppState} from "../AppState";

export interface ErrorsState {
    errors: APIError[]
}

const defaultErrorsState: () => ErrorsState = () => {
  return {
      errors: []
  }
};

const namespaced = true;

export const errors: Module<ErrorsState, AppState> = {
    namespaced,
    state: defaultErrorsState(),
    mutations
};
