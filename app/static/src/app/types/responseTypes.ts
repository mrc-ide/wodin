export interface APIError {
    error: string,
    detail: string | null
}

export interface ResponseFailure {
    status: "failure";
    data: null;
    errors: APIError[];
}

export interface ResponseSuccess {
    status: "success";
    data: unknown;
    errors: null;
}
export interface BasicConfig {
    basicProp: string
}

export interface FitConfig {
    fitProp: string
}

export interface StochasticConfig {
    stochasticProp: string
}

export interface Odin {
    odin: () => unknown
}

export type OdinSolution = (t0: number, t1: number) => {x: number, y: number}[];

export interface OdinRunner {
    runModel: (pars: Record<string, number>, tEnd: number, nPoints: number, odin: Odin, dopri: unknown) => OdinSolution
}

export interface OdinHelpers {
    [k: string]: unknown;
}

export interface OdinUtils {
    runner: OdinRunner,
    helpers: OdinHelpers
}

export interface OdinHelpersConstructor {
    new(): OdinHelpers
}

export interface OdinRunnerConstructor {
    new(helpers: OdinHelpers): OdinRunner
}

export interface OdinUtilsConstructors {
    runner: OdinRunnerConstructor,
    helpers: OdinHelpersConstructor
}
