import Redis from "ioredis";
import { generateId } from "zoo-ids";
import { Request } from "express";
import { AppLocals, SessionMetadata } from "../types";

export const cleanFriendlyId = (id: string): string => {
    let ret = id.toLowerCase();
    const re = /(.+)-(.+)-(.+)/;
    while (ret.match(re)) {
        ret = ret.replace(re, "$1$2-$3");
    }
    return ret;
};

export const friendlyAdjectiveAnimal = (): string => {
    return cleanFriendlyId(generateId(null, {
        caseStyle: "lowercase",
        delimiter: "-",
        numAdjectives: 1
    }));
};

export class SessionStore {
    private readonly _redis: Redis;

    private readonly _sessionPrefix: string;

    private readonly _newFriendlyId: () => string;

    constructor(
        redis: Redis,
        savePrefix: string,
        app: string,
        newFriendlyId: () => string = friendlyAdjectiveAnimal
    ) {
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
            this._redis.hmget(this.sessionKey("label"), ...ids),
            this._redis.hmget(this.sessionKey("friendly"), ...ids)
        ]).then((values) => {
            const times = values[0];
            const labels = values[1];
            const friendlies = values[2];
            const allResults = ids.map((id: string, idx: number) => {
                return {
                    id, time: times[idx], label: labels[idx], friendlyId: friendlies[idx]
                };
            });
            return allResults.filter((session) => session.time !== null) as SessionMetadata[];
        });
    }

    async saveSessionLabel(id: string, label: string) {
        await this._redis.hset(this.sessionKey("label"), id, label);
    }

    async getSessionLabel(id: string) {
        await this._redis.hget(this.sessionKey("label"), id);
    }

    async getSession(id: string) {
        return this._redis.hget(this.sessionKey("data"), id);
    }

    async getSessionIdFromFriendlyId(friendlyId: string) {
        const keyFriendlyToMachine = this.sessionKey("machine");
        return this._redis.hget(keyFriendlyToMachine, friendlyId);
    }

    async generateFriendlyId(id: string, maxRetries: number = 10) : Promise<string> {
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
        let retries = maxRetries;

        // The app will probably not do this, but if an id already exists, return that
        const existing = await this._redis.hget(keyMachineToFriendly, id);
        if (existing) {
            return existing;
        }

        while (retries > 0) {
            const friendly = this._newFriendlyId();
            // Disable lint rule because we need this to be synchronous
            // eslint-disable-next-line no-await-in-loop
            const wasSet = await this._redis.hsetnx(keyFriendlyToMachine, friendly, id);
            if (wasSet) {
                // eslint-disable-next-line no-await-in-loop
                await this._redis.hset(keyMachineToFriendly, id, friendly);
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

export const getSessionStore = (req: Request) => {
    const { redis, wodinConfig } = req.app.locals as AppLocals;
    const { appName } = req.params;
    return new SessionStore(redis, wodinConfig.savePrefix, appName);
};
