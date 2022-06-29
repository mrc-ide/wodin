import { ConfigReader } from "./configReader";
import { DefaultCodeReader } from "./defaultCodeReader";

export interface WodinConfig {
    courseTitle: string,
    port: number,
    odinAPI: string,
    appsPath: string
}

export interface AppConfig {
    appType: string,
    title: string,
    defaultCode: string[] | undefined
}

export interface AppLocals {
    odinAPI: string,
    appsPath: string,
    configPath: string,
    configReader: ConfigReader,
    defaultCodeReader: DefaultCodeReader,
    wodinConfig: WodinConfig,
    wodinVersion: String
}
