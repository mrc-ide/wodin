import Redis from "ioredis";
import { ConfigReader } from "./configReader";
import { AppFileReader } from "./appFileReader";

export interface WodinConfig {
    courseTitle: string,
    savePrefix: string,
    port: number,
    baseUrl: string,
    odinApi: string,
    redisUrl: string,
    appsPath: string,
    i18n: boolean,
    defaultLanguage: string
}

export interface AppConfigBase {
    title: string,
    endTime: number,
    readOnlyCode: boolean,
    stateUploadIntervalMillis: number,
    defaultCode: string[] | undefined
    help?: {
        markdown?: string[]
        tabName?: string
    }
}

export interface AppConfigBasic extends AppConfigBase {
    appType: "basic"
}

export interface AppConfigFit extends AppConfigBase {
    appType: "fit"
}

export interface AppConfigStochastic extends AppConfigBase {
    appType: "stochastic",
    maxReplicatesRun: number,
    maxReplicatesDisplay: number,
}

export type AppConfig = AppConfigBasic | AppConfigFit | AppConfigStochastic;

export interface AppLocals {
    baseUrl: string,
    odinApi: string,
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
