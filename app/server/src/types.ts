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
    appsPath: string
}

export interface AppConfigBase {
    title: string,
    // can we drop this? it's not clear why it's here, or why it is
    // used? try knocking it out and see what fails...
    baseUrl: string,
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
    maxReplicatedDisplay: number,
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
