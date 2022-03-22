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
