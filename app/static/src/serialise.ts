import { AppState, AppType } from "./store/appState/state";
import { FitState } from "./store/fit/state";
import { CodeState } from "./store/code/state";
import { ModelState } from "./store/model/state";
import { RunState } from "./store/run/state";
import { BaseSensitivityState, SensitivityState } from "./store/sensitivity/state";
import { FitDataState } from "./store/fitData/state";
import { ModelFitState } from "./store/modelFit/state";
import { OdinFitResult, OdinRunResultDiscrete, OdinRunResultOde } from "./types/wrapperTypes";
import {
    SerialisedAppState,
    SerialisedModelState,
    SerialisedRunState,
    SerialisedSensitivityState,
    SerialisedRunResult,
    SerialisedSensitivityResult,
    SerialisedModelFitState,
    SerialisedMultiSensitivityState,
    SerialisedGraphsState
} from "./types/serialisationTypes";
import { GraphConfig, GraphsState, defaultGraphSettings } from "./store/graphs/state";
import { Dict } from "./types/utilTypes";
import { MultiSensitivityState } from "./store/multiSensitivity/state";
import { newUid } from "./utils";

function serialiseCode(code: CodeState): CodeState {
    return {
        currentCode: code.currentCode,
        loading: code.loading
    };
}

function serialiseModel(model: ModelState): SerialisedModelState {
    return {
        compileRequired: model.compileRequired,
        odinModelResponse: model.odinModelResponse,
        hasOdin: !!model.odin,
        odinModelCodeError: model.odinModelCodeError,
        paletteModel: model.paletteModel
    };
}

function serialiseSolutionResult(result: OdinRunResultOde | OdinFitResult | null): SerialisedRunResult | null {
    return result
        ? {
              inputs: result.inputs,
              hasResult: !!result.solution,
              error: result.error
          }
        : null;
}

function serialiseDiscreteResult(result: OdinRunResultDiscrete | null): SerialisedRunResult | null {
    return result
        ? {
              inputs: result.inputs,
              hasResult: !!result.solution,
              error: result.error
          }
        : null;
}

function serialiseRun(run: RunState): SerialisedRunState {
    const serialisedParameterSetResults = {} as Dict<SerialisedRunResult | null>;
    Object.keys(run.parameterSetResults).forEach((name) => {
        serialisedParameterSetResults[name] = serialiseSolutionResult(run.parameterSetResults[name]);
    });
    return {
        runRequired: run.runRequired,
        parameterValues: run.parameterValues,
        endTime: run.endTime,
        numberOfReplicates: run.numberOfReplicates,
        parameterSetsCreated: run.parameterSetsCreated,
        parameterSets: run.parameterSets,
        resultOde: serialiseSolutionResult(run.resultOde),
        resultDiscrete: serialiseDiscreteResult(run.resultDiscrete),
        parameterSetResults: serialisedParameterSetResults,
        advancedSettings: run.advancedSettings,
        showUnchangedParameters: run.showUnchangedParameters
    };
}

function serialiseBaseSensitivity(sensitivity: BaseSensitivityState) {
    return {
        running: false,
        sensitivityUpdateRequired: sensitivity.sensitivityUpdateRequired,
        result: sensitivity.result
            ? {
                  hasResult: !!sensitivity.result.batch,
                  error: sensitivity.result.error
              }
            : null
    };
}

function serialiseSensitivity(sensitivity: SensitivityState): SerialisedSensitivityState {
    const serialisedParameterSetResults = {} as Dict<SerialisedSensitivityResult>;
    Object.keys(sensitivity.parameterSetResults).forEach((name) => {
        const result = sensitivity.parameterSetResults[name];
        serialisedParameterSetResults[name] = {
            hasResult: !!result.batch,
            error: result.error
        };
    });

    return {
        ...serialiseBaseSensitivity(sensitivity),
        paramSettings: sensitivity.paramSettings,
        plotSettings: sensitivity.plotSettings,
        parameterSetResults: serialisedParameterSetResults
    };
}

function serialiseMultiSensitivity(multiSensitivity: MultiSensitivityState): SerialisedMultiSensitivityState {
    return {
        ...serialiseBaseSensitivity(multiSensitivity),
        paramSettings: multiSensitivity.paramSettings
    };
}

function serialiseFitData(fitData: FitDataState): FitDataState {
    return {
        data: fitData.data,
        columns: fitData.columns,
        timeVariableCandidates: fitData.timeVariableCandidates,
        timeVariable: fitData.timeVariable,
        linkedVariables: fitData.linkedVariables,
        columnToFit: fitData.columnToFit,
        error: fitData.error
    };
}

function serialiseModelFit(modelFit: ModelFitState): SerialisedModelFitState {
    return {
        fitUpdateRequired: modelFit.fitUpdateRequired,
        iterations: modelFit.iterations,
        converged: modelFit.converged,
        sumOfSquares: modelFit.sumOfSquares,
        paramsToVary: modelFit.paramsToVary,
        result: serialiseSolutionResult(modelFit.result),
        error: modelFit.error
    };
}

// Do not include graph config uids in serialised as we don't want them to contribute to duplicate checks
export const serialiseGraphs = (state: GraphsState): SerialisedGraphsState => {
    return {
        ...state,
        config: state.config.map((c: GraphConfig) => ({
            selectedVariables: c.selectedVariables,
            unselectedVariables: c.unselectedVariables,
            settings: c.settings
        }))
    };
};

export const deserialiseGraphs = (serialised: SerialisedGraphsState): GraphsState => {
    return {
        ...serialised,
        config: serialised.config.map((s) => ({
            id: newUid(),
            selectedVariables: s.selectedVariables,
            unselectedVariables: s.unselectedVariables,
            settings: s.settings
        }))
    };
};

export const serialiseState = (state: AppState): string => {
    const result: SerialisedAppState = {
        openVisualisationTab: state.openVisualisationTab,
        code: serialiseCode(state.code),
        model: serialiseModel(state.model),
        run: serialiseRun(state.run),
        sensitivity: serialiseSensitivity(state.sensitivity),
        multiSensitivity: serialiseMultiSensitivity(state.multiSensitivity),
        graphs: serialiseGraphs(state.graphs)
    };

    if (state.appType === AppType.Fit) {
        const fitState = state as FitState;
        result.fitData = serialiseFitData(fitState.fitData);
        result.modelFit = serialiseModelFit(fitState.modelFit);
    }

    return JSON.stringify(result);
};

export const deserialiseState = (targetState: AppState, serialised: SerialisedAppState): void => {
    Object.assign(targetState, {
        ...targetState,
        ...serialised,
        graphs: serialised.graphs ? deserialiseGraphs(serialised.graphs) : targetState.graphs,
        persisted: true
    });

    // Initialise selected variables if required
    const { model, graphs } = targetState;
    if (
        model.odinModelResponse?.metadata?.variables &&
        !graphs.config[0].selectedVariables.length &&
        !graphs.config[0].unselectedVariables?.length
    ) {
         
        const selectedVariables = [...(model.odinModelResponse?.metadata?.variables || [])];
        const unselectedVariables: string[] = [];

        targetState.graphs.config = [
            {
                id: graphs!.config[0].id,
                selectedVariables,
                unselectedVariables,
                settings: defaultGraphSettings()
            }
        ];
    }
};
