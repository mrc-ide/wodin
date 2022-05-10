import { ConfigReader } from "./configReader";

export interface WodinConfig {
    port: number,
    odinAPI: string,
    appsPath: string
}

export interface AppLocals {
    odinAPI: string,
    appsPath: string,
    configPath: string,
    configReader: ConfigReader
}
