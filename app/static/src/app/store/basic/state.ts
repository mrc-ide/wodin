import { AppState } from "../appState/state";
import { BasicConfig } from "../../types/responseTypes";

export interface BasicState extends AppState {
    config: null | BasicConfig
}
