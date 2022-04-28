export interface RunModelPayload {
    parameters: Record<string, number>,
    start: number,
    end: number,
    control: unknown
}
