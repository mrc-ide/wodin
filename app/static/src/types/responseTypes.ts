import { Dict } from "./utilTypes";

export interface WodinError {
    error: string;
    detail: string | null;
}

export interface ResponseFailure {
    status: "failure";
    data: null;
    errors: WodinError[];
}

export interface ResponseSuccess {
    status: "success";
    data: unknown;
    errors: null;
}

export interface AppConfigBase {
    defaultCode: string[];
    endTime: number;
    readOnlyCode: boolean;
    stateUploadIntervalMillis: number;
    help?: {
        markdown?: string[];
        tabName?: string;
    };
    multiSensitivity?: boolean;
}

export interface BasicConfig extends AppConfigBase {
    appType: "basic";
    // This is used in some testing still.
    basicProp: string;
}

export interface FitConfig extends AppConfigBase {
    appType: "fit";
}

export interface StochasticConfig extends AppConfigBase {
    appType: "stochastic";
    maxReplicatesRun: number;
    maxReplicatesDisplay: number;
}

export type AppConfig = BasicConfig | FitConfig | StochasticConfig;

export interface Odin {
    new (...args: unknown[]): unknown;
}

export interface OdinParameter {
    name: string;
    default: null | number;
    min: null | number;
    max: null | number;
    is_integer: boolean;
    rank: number;
}

export interface OdinModelResponseError {
    line: number[];
    message: string;
}

export interface OdinMetadataMessage {
    line: number[];
    message: string;
}

export interface OdinModelResponse {
    valid: boolean;
    metadata?: {
        variables: string[];
        dt: number | null;
        parameters: OdinParameter[];
        messages: OdinMetadataMessage[];
    };
    model?: string;
    error?: OdinModelResponseError;
}

// This is strictly a little more restrictive than what odin supports,
// but wodin does not support fancy user variables yet and we can sort
// that out later (odin allows the union of number, number[], and a
// tensor type - the latter two will be a challenge to expose nicely
// in the interface).
export type OdinUserType = Dict<number>;

// This is Odin's SeriesSetValues and SeriesSet
export interface OdinSeriesSetValues {
    description?: string;
    name: string;
    y: number[];
}

export type OdinSeriesSet = {
    x: number[];
    values: OdinSeriesSetValues[];
};

export type OdinUserTypeSeriesSet = {
    x: OdinUserType[];
    values: OdinSeriesSetValues[];
};

export interface TimeGrid {
    mode: "grid";
    tStart: number;
    tEnd: number;
    nPoints: number;
}

export interface TimeGiven {
    mode: "given";
    times: number[];
}

export type Times = TimeGrid | TimeGiven;

// This is Odin's InterpolatedSolution
export type OdinSolution = (times: Times) => OdinSeriesSet;

export interface OdinFitData {
    time: number[];
    value: number[];
}

export interface OdinFitParameters {
    base: OdinUserType;
    vary: string[];
}

// This is FitResult in Odin
export interface SimplexResult {
    iterations: number;
    converged: boolean;
    value: number;
    data: {
        endTime: number;
        names: string[];
        solution: OdinSolution;
        pars: OdinUserType;
    };
}

export interface Simplex {
    step: () => boolean;
    result: () => SimplexResult;
}

export interface VaryingPar {
    name: string;
    values: number[];
}

export interface BatchPars {
    base: OdinUserType;
    varying: VaryingPar[];
}

export interface OdinRunStatus {
    pars: OdinUserType;
    success: boolean;
    error: string | null;
}

export interface Batch {
    pars: BatchPars;
    solutions: OdinSolution[];
    errors: OdinRunStatus[];
    successfulVaryingParams: OdinUserType[];
    valueAtTime: (time: number) => OdinUserTypeSeriesSet;
    extreme: (type: string) => OdinUserTypeSeriesSet;
    compute: () => boolean;
}

export type AdvancedSettingsOdin = {
    atol: number | null;
    rtol: number | null;
    maxSteps: number | null;
    stepSizeMax: number | null;
    stepSizeMin: number | null;
    tcrit: number | null;
};

export enum AdvancedOptions {
    "tol" = "Tolerance",
    "maxSteps" = "Max steps",
    "stepSizeMax" = "Max step size",
    "stepSizeMin" = "Min step size",
    "tcrit" = "Critical times"
}

export interface OdinRunnerOde {
    wodinRun: (
        odin: Odin,
        pars: OdinUserType,
        tStart: number,
        tEnd: number,
        control: AdvancedSettingsOdin
    ) => OdinSolution;

    wodinFit: (
        odin: Odin,
        data: OdinFitData,
        pars: OdinFitParameters,
        modelledSeries: string,
        odeParams: AdvancedSettingsOdin,
        simplexParams: Dict<unknown>
    ) => Simplex;

    wodinFitValue: (solution: OdinSolution, data: OdinFitData, modelledSeries: string) => number;

    batchParsRange: (
        base: OdinUserType,
        name: string,
        count: number,
        logarithmic: boolean,
        min: number,
        max: number
    ) => VaryingPar;

    batchParsDisplace: (
        base: OdinUserType,
        name: string,
        count: number,
        logarithmic: boolean,
        displace: number
    ) => VaryingPar;
    batchRun: (odin: Odin, pars: BatchPars, tStart: number, tEnd: number, control: AdvancedSettingsOdin) => Batch;
}

export interface DiscreteSeriesValues {
    description?: string;
    name: string;
    y: number[];
}

export interface DiscreteSeriesSet {
    x: number[];
    values: DiscreteSeriesValues[];
}

export type FilteredDiscreteSolution = (times: Times) => DiscreteSeriesSet;

export interface OdinRunnerDiscrete {
    wodinRunDiscrete: (
        odin: Odin, // this is vague enough to work at present
        pars: OdinUserType, // this will always be ok
        timeStart: number,
        timeEnd: number,
        dt: number,
        nParticles: number
    ) => FilteredDiscreteSolution;
    batchRunDiscrete: (
        odin: Odin,
        pars: BatchPars,
        timeStart: number,
        timeEnd: number,
        dt: number,
        nParticles: number
    ) => Batch;
}

export interface SessionMetadata {
    id: string;
    time: string;
    label: string | null;
    friendlyId: string | null;
}

export type Versions = Dict<string>;
