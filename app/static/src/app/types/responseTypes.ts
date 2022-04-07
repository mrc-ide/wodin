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

// TODO: sort out the anys!
export interface Odin {
    odin: () => any
}

export type OdinSolution = (t0: number, t1: number) => any;

export interface OdinRunner {
    runModel: (pars: Record<string, number>, tEnd: number, nPoints: number, odin: Odin, dopri: any) => OdinSolution
}

export interface OdinHelpers {
    [k: string]: any;
}

export interface OdinUtils {
    runner: OdinRunner,
    helpers: OdinHelpers
}
