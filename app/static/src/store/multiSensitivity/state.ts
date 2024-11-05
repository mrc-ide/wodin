import { BaseSensitivityState, SensitivityParameterSettings } from "../sensitivity/state";

export interface MultiSensitivityState extends BaseSensitivityState {
    paramSettings: SensitivityParameterSettings[];
}
