import {AppState, AppType} from "./store/appState/state";
import {FitState} from "./store/fit/state";
import {CodeState} from "./store/code/state";
import {ModelState} from "./store/model/state";
import {RunState} from "./store/run/state";
import {SensitivityState} from "./store/sensitivity/state";
import {FitDataState} from "./store/fitData/state";
import {ModelFitState} from "./store/modelFit/state";

function serialiseCode(code: CodeState) {
    return {
        currentCode: code.currentCode
    };
}

function serialiseModel(model: ModelState) {
    return {
        compileRequired: model.compileRequired,
        odinModelResponse: model.odinModelResponse,
        hasOdin: !!model.odin,
        odinModelCodeError: model.odinModelCodeError
    };
}

function serialiseRun(run: RunState) {
    return {
        runRequired: run.runRequired,
        parameterValues: run.parameterValues,
        endTime: run.endTime,
        result: run.result ? {
            inputs: run.result.inputs,
            hasResult: !!run.result.solution,
            error: run.result.error
        } : null
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
        result: modelFit.result ? {
            inputs: modelFit.result.inputs,
            hasResult: !!modelFit.result.solution,
            error: modelFit.result.error
        } : null
    };
}

export const serialiseState = (state: AppState) => {
    const result = {
        openVisualisationTab: state.openVisualisationTab,
        code: serialiseCode(state.code),
        model: serialiseModel(state.model),
        run: serialiseRun(state.run),
        sensitivity: serialiseSensitivity(state.sensitivity),
        fitData: (state.appType === AppType.Fit) ?  serialiseFitData((state as FitState).fitData) : undefined,
        modelFit: (state.appType === AppType.Fit) ? serialiseModelFit((state as FitState).modelFit) : undefined
    };
    return JSON.stringify(result);
};
