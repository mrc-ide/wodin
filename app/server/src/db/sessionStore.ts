import Redis from "ioredis";

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
        const result = [];
        for (const id of ids) {
            // eslint-disable-next-line no-await-in-loop
            const time = await this._redis.hget(this.sessionKey(id), "time");
            const label = await this._redis.hget(this.sessionKey(id), "label");
            result.push({id, time, label});
        }
        return result;
    }
}
