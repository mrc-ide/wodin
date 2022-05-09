import { ConfigReader } from "./configReader";

export interface WodinConfig {
    port: number,
    appsPath: string
}

export interface AppLocals {
    appsPath: string,
    configPath: string,
    configReader: ConfigReader
}
