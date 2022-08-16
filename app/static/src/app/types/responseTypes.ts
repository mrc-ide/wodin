import { Dict } from "./utilTypes";

export interface WodinError {
    error: string,
    detail: string | null
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

export interface AppConfig {
    defaultCode: string[],
    readOnlyCode: boolean
}

export interface BasicConfig extends AppConfig {
    basicProp: string
}

export interface FitConfig extends AppConfig {
    fitProp: string
}

export interface StochasticConfig extends AppConfig {
    stochasticProp: string
}

export interface Odin {
    new(...args : unknown[]): unknown
}

export interface OdinParameter {
    name: string,
    default: null | number,
    min: null | number,
    max: null | number,
    // eslint-disable-next-line camelcase
    is_integer: boolean,
    rank: number
}

export interface OdinModelResponseError {
    line: string[],
    message: string
}

export interface OdinModelResponse{
    valid: boolean,
    metadata?: {
        variables: string[],
        parameters: OdinParameter[],
        messages: string[]
    },
    model?: string,
    error?: OdinModelResponseError
}

// This is Odin's SeriesSet
export type OdinSeriesSet = {
    names: string[];
    x: number[];
    y: number[][];
}

// This is Odin's InterpolatedSolution
export type OdinSolution = (t0: number, t1: number, nPoints: number) => OdinSeriesSet;

export interface OdinFitData {
    time: number[],
    value: number[]
}

export interface OdinFitParameters {
    base: Map<string, number>,
    vary: string[]
}

// This is FitResult in Odin
export interface SimplexResult {
    iterations: number;
    converged: boolean;
    value: number;
    data: {
        names: string[],
        solution: OdinSolution,
        pars: Map<string, number>
    }
}

export interface Simplex {
    step: () => boolean;
    result: () => SimplexResult;
}

export interface BatchPars {
    base: Map<string, number>;
    name: string;
    values: number[];
}

export type OdeControl = Dict<unknown>;

export interface Batch {
    pars: BatchPars,
    solutions: OdinSolution[]
}

export interface OdinRunner {
    wodinRun: (odin: Odin,
               pars: Map<string, number>,
               tStart: number,
               tEnd: number,
               control: OdeControl) => OdinSolution;

    wodinFit: (odin: Odin,
               data: OdinFitData,
               pars: OdinFitParameters,
               modelledSeries: string,
               odeParams: OdeControl,
               simplexParams: Dict<unknown>) => Simplex;

    batchParsRange: (base: Map<string, number>,
                     name: string,
                     count: number,
                     logarithmic: boolean,
                     min: number,
                     max: number) => BatchPars;

    batchParsDisplace: (base: Map<string, number>,
                        name: string,
                        count: number,
                        logarithmic: boolean,
                        displace: number) => BatchPars;
    batchRun: (odin: Odin,
               pars: BatchPars,
               tStart: number,
               tEnd: number,
               control: OdeControl) => Batch;
}
