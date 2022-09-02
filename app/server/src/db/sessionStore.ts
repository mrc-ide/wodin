import Redis from "ioredis";
import { SessionMetadata } from "../types";

export class SessionStore {
    private readonly _redis: Redis;

    private readonly _sessionPrefix: string;

    constructor(redis: Redis, savePrefix: string, app: string) {
        this._redis = redis;
        this._sessionPrefix = `${savePrefix}:${app}:sessions:`;
    }

    private sessionKey = (name: string) => `${this._sessionPrefix}${name}`;

    async saveSession(id: string, data: string) {
        await this._redis.pipeline()
            .hset(this.sessionKey("time"), id, new Date(Date.now()).toISOString())
            .hset(this.sessionKey("data"), id, data)
            .exec();
    }

    async getSessionsMetadata(ids: string[]) {
        return Promise.all([
            this._redis.hmget(this.sessionKey("time"), ...ids),
            this._redis.hmget(this.sessionKey("label"), ...ids)
        ]).then((values) => {
            const times = values[0];
            const labels = values[1];
            const allResults = ids.map((id: string, idx: number) => {
                return {id, time: times[idx], label: labels[idx]};
            });
            return allResults.filter((session) => session.time !== null) as SessionMetadata[];
        });
    };

    async saveSessionLabel(id: string, label: string) {
        await this._redis.hset(this.sessionKey("label"), id, label);
    };
}
