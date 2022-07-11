import {Dict} from "./utilTypes";

export interface Error {
    error: string,
    detail: string | null
}

export interface ResponseFailure {
    status: "failure";
    data: null;
    errors: Error[];
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

export interface OdinModelResponse{
    valid: boolean,
    metadata: {
        variables: string[],
        parameters: OdinParameter[],
        messages: string[]
    },
    model: string
}

export type OdinSolution = (t0: number, t1: number, nPoints: number) => {x: number, y: number}[];

export interface OdinFitData {
    time: number[],
    value: number[]
}

export interface OdinFitParameters {
    base: Map<string, number>,
    vary: string[]
}

export interface SimplexResult {
    iterations: number;
    converged: boolean;
    data: any
}

export interface Simplex {
    step: () => boolean;
    result: () => SimplexResult;
}

export interface OdinRunner {
    wodinRun: (odin: Odin,
               pars: Map<string, number>,
               tStart: number,
               tEnd: number) => OdinSolution;

    wodinFit: (odin: Odin,
               data: OdinFitData,
               pars: OdinFitParameters) => Simplex;
}
