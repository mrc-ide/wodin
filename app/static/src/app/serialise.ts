import {AppState, AppType} from "./store/appState/state";
import { FitState } from "./store/fit/state";
import { CodeState } from "./store/code/state";
import { ModelState } from "./store/model/state";
import {RunState,} from "./store/run/state";
import {SensitivityState} from "./store/sensitivity/state";
import { FitDataState } from "./store/fitData/state";
import { ModelFitState} from "./store/modelFit/state";
import { OdinFitResult, OdinRunResult} from "./types/wrapperTypes";
import {
    SerialisedAppState, SerialisedModelState,
    SerialisedRunState,
    SerialisedSensitivityState,
    SerialisedSolutionResult
} from "./types/serialisationTypes";

function serialiseCode(code: CodeState) : CodeState {
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

function serialiseSolutionResult(result: OdinRunResult | OdinFitResult | null): SerialisedSolutionResult | null {
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

function serialiseSensitivity(sensitivity: SensitivityState): SerialisedSensitivityState {
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

export const serialiseState = (state: AppState) => {
    const result: SerialisedAppState = {
        openVisualisationTab: state.openVisualisationTab,
        code: serialiseCode(state.code),
        model: serialiseModel(state.model),
        run: serialiseRun(state.run),
        sensitivity: serialiseSensitivity(state.sensitivity)
    };

    if (state.appType === AppType.Fit) {
        const fitState = state as FitState;
        result.fitData = serialiseFitData(fitState.fitData);
        result.modelFit = serialiseModelFit(fitState.modelFit);
    }

    return JSON.stringify(result);
};

export deserialiseState = (targetState: AppState, serialised: SerialisedAppState) => {

}
