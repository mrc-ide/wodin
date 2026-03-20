import { MutationPayload, Store } from "vuex";
import { AppState } from "./appState/state";
import { StateUploadMutations } from "./appState/mutations";
import { RunMutation } from "./run/mutations";
import { RunAction } from "./run/actions";
import { SensitivityAction } from "./sensitivity/actions";
import { BaseSensitivityMutation, SensitivityMutation } from "./sensitivity/mutations";
import { FitDataMutation } from "./fitData/mutations";
import { ModelFitMutation } from "./modelFit/mutations";
import { GraphsAction } from "./graphs/actions";
import { GraphsMutation } from "./graphs/mutations";

export const logMutations = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        console.log(mutation.type);
    });
};

export const persistState = (store: Store<AppState>): void => {
    store.subscribe((mutation: MutationPayload) => {
        if (!StateUploadMutations.includes(mutation.type) && !mutation.type.startsWith("errors")) {
            const { dispatch } = store;
            dispatch("QueueStateUpload");
        }
    });
};

const updateGraphOnMutations = [
    // run button
    `run/${RunMutation.SetResultOde}`,
    `run/${RunMutation.SetParameterSetResult}`,
    `run/${RunMutation.SetResultDiscrete}`,

    // parameter set changes
    `run/${RunMutation.DeleteParameterSet}`,
    `sensitivity/${SensitivityMutation.ParameterSetDeleted}`,
    `run/${RunMutation.SwapParameterSet}`,
    `sensitivity/${SensitivityMutation.ParameterSetSwapped}`,
    `run/${RunMutation.ToggleParameterSetHidden}`,
    `run/${RunMutation.SaveParameterDisplayName}`,

    // fit data changes
    `fitData/${FitDataMutation.SetData}`,
    `fitData/${FitDataMutation.SetTimeVariable}`,
    `fitData/${FitDataMutation.SetLinkedVariable}`,
    `fitData/${FitDataMutation.SetLinkedVariables}`,

    // fit button
    `modelFit/${ModelFitMutation.SetResult}`,

    // run sensitivity
    `sensitivity/${BaseSensitivityMutation.SetResult}`,
    `sensitivity/${SensitivityMutation.SetParameterSetResults}`,
    `sensitivity/${SensitivityMutation.SetPlotExtreme}`,
    `sensitivity/${SensitivityMutation.SetPlotTime}`,

    // change endTime
    `run/${RunMutation.SetEndTime}`,

    // graphs mutations
    `graphs/${GraphsMutation.AddConfig}`,
    `graphs/${GraphsMutation.UpdateConfig}`,
    `graphs/${GraphsMutation.DeleteConfig}`,
    `graphs/${GraphsMutation.UpdateConfigGroup}`,
    `graphs/${GraphsMutation.UpdateGraphGroup}`,
    `graphs/${GraphsMutation.UpdateVisibleGraphGroups}`,
];

export const updateGraphs = (store: Store<AppState>) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    store.subscribe(mutation => {
        if (updateGraphOnMutations.includes(mutation.type)) {
            if (timeout) globalThis.clearTimeout(timeout);
            timeout = globalThis.setTimeout(() => {
                store.dispatch(
                    `graphs/${GraphsAction.GenerateData}`,
                    null,
                    { root: true }
                );
            }, 0);
        }
    });
};

export const registerRerunModel = (store: Store<AppState>): void => {
    store.dispatch(`run/${RunAction.RunModel}`);
    store.subscribe((mutation: MutationPayload) => {
        if (mutation.type === `run/${RunMutation.SetParameterValues}`) {
            store.dispatch(`run/${RunAction.RunModel}`);
        }
    });
};

export const registerRerunSensitivity = (store: Store<AppState>): void => {
    store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
    store.subscribe((mutation: MutationPayload) => {
        if (mutation.type === `run/${RunMutation.SetParameterValues}`) {
            store.dispatch(`sensitivity/${SensitivityAction.RunSensitivity}`);
        }
    });
};
