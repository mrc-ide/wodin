import Redis from "ioredis";
import { ConfigReader } from "./configReader";
import { AppFileReader } from "./appFileReader";

export interface WodinConfig {
    courseTitle: string,
    savePrefix: string,
    port: number,
    baseUrl: string,
    odinAPI: string,
    redisURL: string,
    appsPath: string
}

export interface AppConfig {
    appType: string,
    title: string,
    baseUrl: string,
    defaultCode: string[] | undefined
    help?: {
        markdown?: string[]
        tabName?: string
    }
}

export interface AppLocals {
    baseUrl: string,
    odinAPI: string,
    appsPath: string,
    configPath: string,
    configReader: ConfigReader,
    defaultCodeReader: AppFileReader,
    appHelpReader: AppFileReader,
    wodinConfig: WodinConfig,
    wodinVersion: String,
    redis: Redis
}

export interface SessionMetadata {
    id: string,
    time: string,
    label: string | null,
    friendlyId: string | null
}
