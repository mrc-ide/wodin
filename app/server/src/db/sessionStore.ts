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
        return Promise.all([
            this._redis.hmget(this.sessionKey("time"), ...ids),
            this._redis.hmget(this.sessionKey("label"), ...ids)
        ]).then((values) => {
            const times = values[0];
            const labels = values[1];
            return ids.map((id: string, idx: number) => {
                return { id, time: times[idx], label: labels[idx] };
            });
        });
    }
}
