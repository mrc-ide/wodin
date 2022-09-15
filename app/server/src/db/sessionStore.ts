import Redis from "ioredis";
import { SessionMetadata } from "../types";
import { generateId } from "zoo-ids";

export const friendlyAdjectiveAnimal = () => {
    return generateId(null, {
        caseStyle: "lowercase",
        delimiter: "-",
        numAdjectives: 1
    });
};

export class SessionStore {
    private readonly _redis: Redis;

    private readonly _sessionPrefix: string;

    private readonly _newFriendlyId: () => string;

    constructor(redis: Redis, savePrefix: string, app: string,
                newFriendlyId: () => string = friendlyAdjectiveAnimal) {
        this._redis = redis;
        this._sessionPrefix = `${savePrefix}:${app}:sessions:`;
        this._newFriendlyId = newFriendlyId;
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
                return { id, time: times[idx], label: labels[idx] };
            });
            return allResults.filter((session) => session.time !== null) as SessionMetadata[];
        });
    }

    async saveSessionLabel(id: string, label: string) {
        await this._redis.hset(this.sessionKey("label"), id, label);
    }

    async getSession(id: string) {
        return this._redis.hget(this.sessionKey("data"), id);
    }

    async generateFriendlyId(id: string, retries: number = 10) : Promise<string> {
        // Try several times to generate a friendly id but fall back
        // on the machine readable id (which should be globally
        // unique) in the unlikely event that we can't find a free
        // friendly id, avoiding both collisions and infinite
        // loops. There are ~300k possible friendly ids with our
        // current configuration so is essentially impossible unless
        // we have something on the order of 100k sessions, but single
        // collisions are likely enough to be worth the faff of
        // retrying, and it makes sense to avoid an infinite loop...
        const keyFriendlyToMachine = this.sessionKey("machine");
        const keyMachineToFriendly = this.sessionKey("friendly");

        // The app will probably not do this, but if an id already exists, return that
        const existing = await this._redis.hget(keyMachineToFriendly, id);
        if (existing) {
            return existing;
        }

        while (retries > 0) {
            const friendly = this._newFriendlyId();
            const wasSet = await this._redis.hsetnx(keyFriendlyToMachine, friendly, id);
            if (wasSet) {
                this._redis.hset(keyMachineToFriendly, id, friendly);
                return friendly;
            }
            retries -= 1;
        }

        // Fall-back on linking machine to machine
        await this._redis.hset(keyFriendlyToMachine, id, id);
        await this._redis.hset(keyMachineToFriendly, id, id);
        return id;
    }
}
