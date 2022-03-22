import { AppState } from "../AppState";
import { BasicConfig } from "../../responseTypes";

export interface BasicState extends AppState {
    config: null | BasicConfig
}
