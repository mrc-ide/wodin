import {AppState, AppType, VisualisationTab} from "./store/appState/state";
import { FitState } from "./store/fit/state";
import { CodeState } from "./store/code/state";
import { ModelState } from "./store/model/state";
import {RunState, RunUpdateRequiredReasons} from "./store/run/state";
import { SensitivityState } from "./store/sensitivity/state";
import { FitDataState } from "./store/fitData/state";
import { ModelFitState } from "./store/modelFit/state";
import {OdinFitInputs, OdinFitResult, OdinRunInputs, OdinRunResult} from "./types/wrapperTypes";
import {OdinModelResponse, OdinUserType, WodinError} from "./types/responseTypes";

function serialiseCode(code: CodeState) {
    return {
        currentCode: code.currentCode
    };
}

function serialiseModel(model: ModelState) : SerialisedModelState {
    return {
        compileRequired: model.compileRequired,
        odinModelResponse: model.odinModelResponse,
        hasOdin: !!model.odin,
        odinModelCodeError: model.odinModelCodeError
    };
}

function serialiseSolutionResult(result: OdinRunResult | OdinFitResult | null): SerialisedSolutionResult {
    return result ? {
        inputs: result.inputs,
        hasResult: !!result.solution,
        error: result.error
    } : null;
}

function serialiseRun(run: RunState): SerialisedRunState {
    return {
        runRequired: run.runRequired,
        parameterValues: run.parameterValues,
        endTime: run.endTime,
        result: serialiseSolutionResult(run.result)
    };
}

function serialiseSensitivity(sensitivity: SensitivityState) {
    return {
        paramSettings: sensitivity.paramSettings,
        sensitivityUpdateRequired: sensitivity.sensitivityUpdateRequired,
        plotSettings: sensitivity.plotSettings,
        result: sensitivity.result ? {
            inputs: sensitivity.result.inputs,
            hasResult: !!sensitivity.result.batch,
            error: sensitivity.result.error
        } : null
    };
}

function serialiseFitData(fitData: FitDataState) {
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

function serialiseModelFit(modelFit: ModelFitState) {
    return {
        fitUpdateRequired: modelFit.fitUpdateRequired,
        iterations: modelFit.iterations,
        converged: modelFit.converged,
        sumOfSquares: modelFit.sumOfSquares,
        paramsToVary: modelFit.paramsToVary,
        result: serialiseSolutionResult(modelFit.result)
    };
}

// TODO: mode types into types folder
export interface SerialisedModelState {
    compileRequired: boolean,
    odinModelResponse: OdinModelResponse | null,
    hasOdin: boolean,
    odinModelCodeError: WodinError
}

export interface SerialisedRunState {
    runRequired: RunUpdateRequiredReasons,
    parameterValues: OdinUserType | null,
    endTime: number,
    result: SerialisedSolutionResult | null
}

export interface SerialisedSolutionResult {
    inputs: OdinRunInputs | OdinFitInputs,
    hasResult: boolean
    error: WodinError | null
}

export interface SerialisedAppState {
    openVisualisationTab: VisualisationTab,
    code: CodeState,
    model: SerialisedModelState,
    run: SerialisedRunState
}

export const serialiseState = (state: AppState) : SerialisedAppState => {
    const result = {
        openVisualisationTab: state.openVisualisationTab,
        code: serialiseCode(state.code),
        model: serialiseModel(state.model),
        run: serialiseRun(state.run),
        sensitivity: serialiseSensitivity(state.sensitivity)
    } as any; // TODO: generate type from schema

    if (state.appType === AppType.Fit) {
        const fitState = state as FitState;
        result.fitData = serialiseFitData(fitState.fitData);
        result.modelFit = serialiseModelFit(fitState.modelFit);
    }

    return JSON.stringify(result);
};



export deserialiseState = (targetState: AppState, serialised: SerialisedAppState) => {

}
