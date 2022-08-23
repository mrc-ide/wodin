import Redis from "ioredis";

export class SessionStore {
    private readonly _redis: Redis;

    private readonly _sessionPrefix: string;

    constructor(redis: Redis, course: string, app: string) {
        this._redis = redis;
        this._sessionPrefix = `${course}:${app}:sessions:`;
    }

    private sessionKey = (name: string) => `${this._sessionPrefix}${name}`;

    async saveSession(id: string, data: any) {
        await this._redis.pipeline()
            .hset(this.sessionKey("time"), id, new Date().toISOString())
            .hset(this.sessionKey("data"), id, JSON.stringify(data))
            .exec();
    }
}
