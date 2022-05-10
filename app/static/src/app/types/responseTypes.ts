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
    new(...args : unknown[]): unknown
}

export interface OdinModelResponse{
    valid: boolean,
    metadata: {
        variables: string[],
        parameters: string[],
        messages: string[]
    },
    model: string
}

export type OdinSolution = (t0: number, t1: number, nPoints: number) => {x: number, y: number}[];

export type OdinRunner = (dopri: unknown,
                          odin: Odin,
                          pars: Record<string, number>,
                          tStart: number,
                          tEnd: number,
                          control: unknown) => OdinSolution;
