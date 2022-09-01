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
        console.log("ids:" + JSON.stringify(ids))
        const result = [];
        console.log("session key on get is: " + this.sessionKey("time"))
        for (const id of ids) {
            // eslint-disable-next-line no-await-in-loop
            const time = await this._redis.hget(this.sessionKey("time"), id);
            console.log("got time value: " + time)
            const label = await this._redis.hget(this.sessionKey("label"), id);
            result.push({id, time, label});
        }
        return result;
    }
}
