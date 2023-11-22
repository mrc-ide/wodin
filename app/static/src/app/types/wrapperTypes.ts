import { Batch, BatchPars, FilteredDiscreteSolution, OdinSolution, OdinUserType, WodinError } from "./responseTypes";
import { FitData, FitDataLink } from "../store/fitData/state";

export interface OdinRunInputs {
    parameterValues: OdinUserType;
    endTime: number;
}

export interface OdinRunDiscreteInputs extends OdinRunInputs {
    numberOfReplicates: number;
}

export interface OdinRunResultOde {
    inputs: OdinRunInputs;
    solution: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinRunResultDiscrete {
    inputs: OdinRunDiscreteInputs;
    solution: FilteredDiscreteSolution | null;
    error: WodinError | null;
}

export interface OdinFitInputs {
    parameterValues: OdinUserType;
    endTime: number;
    data: FitData;
    link: FitDataLink;
}

export interface OdinFitResult {
    inputs: OdinFitInputs;
    solution: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinSensitivityInputs {
    endTime: number;
    pars: BatchPars;
}

export interface OdinSensitivityResult {
    inputs: OdinSensitivityInputs;
    batch: Batch | null;
    error: WodinError | null;
}
