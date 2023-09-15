import { AppState, AppType } from "./store/appState/state";
import { FitState } from "./store/fit/state";
import { CodeState } from "./store/code/state";
import { ModelState } from "./store/model/state";
import { RunState } from "./store/run/state";
import { SensitivityState } from "./store/sensitivity/state";
import { FitDataState } from "./store/fitData/state";
import { ModelFitState } from "./store/modelFit/state";
import { OdinFitResult, OdinRunResultDiscrete, OdinRunResultOde } from "./types/wrapperTypes";
import {
    SerialisedAppState, SerialisedModelState,
    SerialisedRunState,
    SerialisedSensitivityState,
    SerialisedRunResult, SerialisedSensitivityResult, SerialisedModelFitState
} from "./types/serialisationTypes";
import { GraphSettingsState } from "./store/graphSettings/state";
import { Dict } from "./types/utilTypes";

function serialiseCode(code: CodeState) : CodeState {
    return {
        currentCode: code.currentCode,
        loading: code.loading
    };
}

function serialiseModel(model: ModelState) : SerialisedModelState {
    return {
        compileRequired: model.compileRequired,
        odinModelResponse: model.odinModelResponse,
        hasOdin: !!model.odin,
        odinModelCodeError: model.odinModelCodeError,
        paletteModel: model.paletteModel,
        selectedVariables: model.selectedVariables,
        unselectedVariables: model.unselectedVariables
    };
}

function serialiseSolutionResult(result: OdinRunResultOde | OdinFitResult | null): SerialisedRunResult | null {
    return result ? {
        inputs: result.inputs,
        hasResult: !!result.solution,
        error: result.error
    } : null;
}

function serialiseDiscreteResult(result: OdinRunResultDiscrete | null): SerialisedRunResult | null {
    return result ? {
        inputs: result.inputs,
        hasResult: !!result.solution,
        error: result.error
    } : null;
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
        advancedSettings: run.advancedSettings
    };
}

function serialiseSensitivity(sensitivity: SensitivityState): SerialisedSensitivityState {
    const serialisedParameterSetResults = {} as Dict<SerialisedSensitivityResult>;
    Object.keys(sensitivity.parameterSetResults).forEach((name) => {
        const result = sensitivity.parameterSetResults[name];
        serialisedParameterSetResults[name] = {
            inputs: result.inputs,
            hasResult: !!result.batch,
            error: result.error
        };
    });

    return {
        running: false,
        paramSettings: sensitivity.paramSettings,
        sensitivityUpdateRequired: sensitivity.sensitivityUpdateRequired,
        plotSettings: sensitivity.plotSettings,
        result: sensitivity.result ? {
            inputs: sensitivity.result.inputs,
            hasResult: !!sensitivity.result.batch,
            error: sensitivity.result.error
        } : null,
        parameterSetResults: serialisedParameterSetResults
    };
}

function serialiseFitData(fitData: FitDataState) : FitDataState {
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
        result: serialiseSolutionResult(modelFit.result)
    };
}

export const serialiseGraphSettings = (state: GraphSettingsState): GraphSettingsState => {
    return { ...state };
};

export const serialiseState = (state: AppState): string => {
    const result: SerialisedAppState = {
        openVisualisationTab: state.openVisualisationTab,
        code: serialiseCode(state.code),
        model: serialiseModel(state.model),
        run: serialiseRun(state.run),
        sensitivity: serialiseSensitivity(state.sensitivity),
        graphSettings: serialiseGraphSettings(state.graphSettings)
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
        ...serialised
    });

    // Initialise selected variables if required
    const { model } = targetState;
    if (model.odinModelResponse?.metadata?.variables && !model.selectedVariables?.length
        && !model.unselectedVariables?.length) {
        /* eslint-disable no-param-reassign */
        targetState.model.selectedVariables = [...model.odinModelResponse.metadata.variables];
        targetState.model.unselectedVariables = [];
    }
};
