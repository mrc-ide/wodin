import { AppState } from "../AppState";
import { BasicConfig } from "../../types/responseTypes";

export interface BasicState extends AppState {
    config: null | BasicConfig
}
