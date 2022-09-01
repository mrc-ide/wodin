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
        console.log("session key on save is: " + this.sessionKey("time"))
        await this._redis.pipeline()
            .hset(this.sessionKey("time"), id, new Date(Date.now()).toISOString())
            .hset(this.sessionKey("data"), id, data)
            .exec();
    }

    async getSessionsMetadata(ids: string[]) {
        const result: any[] = [];
        for (const id of ids) {
            await Promise.all([
                this._redis.hget(this.sessionKey("time"), id),
                this._redis.hget(this.sessionKey("label"), id)
            ]).then((values) => {
                result.push({id, time: values[0], label: values[1]});
            });
        }
        return result;
    }
}
