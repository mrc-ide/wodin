import Redis from "ioredis";
import { ConfigReader } from "./configReader";
import { DefaultCodeReader } from "./defaultCodeReader";

export interface WodinConfig {
    courseTitle: string,
    savePrefix: string,
    port: number,
    odinAPI: string,
    redisURL: string,
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
    wodinVersion: String,
    redis: Redis
}
