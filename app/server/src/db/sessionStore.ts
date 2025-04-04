import type Redis from "ioredis";
import md5 from "md5";
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

    private static hashForData = (data: string) => md5(data);

    private saveMissingSessionHash = async (sessionId: string, hash: string) => {
        await this._redis.hset(this.sessionKey("hash"), sessionId, hash);
    };

    async saveSession(id: string, data: string) {
        const hash = SessionStore.hashForData(data);
        await this._redis.pipeline()
            .hset(this.sessionKey("time"), id, new Date(Date.now()).toISOString())
            .hset(this.sessionKey("data"), id, data)
            .hset(this.sessionKey("hash"), id, hash)
            .exec();
    }

    async getSessionsMetadata(ids: string[], removeDuplicates: boolean = true) {
        return Promise.all([
            this._redis.hmget(this.sessionKey("time"), ...ids),
            this._redis.hmget(this.sessionKey("label"), ...ids),
            this._redis.hmget(this.sessionKey("friendly"), ...ids),
            this._redis.hmget(this.sessionKey("hash"), ...ids)
        ]).then(async (values) => {
            const times = values[0];
            const labels = values[1];
            const friendlies = values[2];
            const hashes = values[3];

            const buildSessionMetadata = (id: string, idx: number) => ({
                id, time: times[idx], label: labels[idx], friendlyId: friendlies[idx]
            });

            let allResults;
            if (removeDuplicates) {
                // We return all labelled sessions, and also the latest session for any hash (labelled or unlabelled)
                const labelledSessions: SessionMetadata[] = [];
                const latestByHash: Record<string, SessionMetadata> = {};

                const saveMissingHashes = [];
                for await (const [idx, id] of ids.entries()) {
                    if (times[idx] !== null) {
                        const session = buildSessionMetadata(id, idx) as SessionMetadata;

                        if (session.label) {
                            labelledSessions.push(session);
                        }

                        let hash = hashes[idx];
                        // For backward compatibility, save hash for data if not present
                        if (hash === null) {
                            const data = await this.getSession(id);
                            hash = SessionStore.hashForData(data!);
                            saveMissingHashes.push(this.saveMissingSessionHash(id, hash));
                        }

                        if (!latestByHash[hash] || session.time > latestByHash[hash].time) {
                            latestByHash[hash] = session;
                        }
                    }
                }
                await Promise.all(saveMissingHashes);
                allResults = [
                    ...labelledSessions,
                    ...Object.values(latestByHash).filter((s) => !s.label) // don't include labelled sessions twice
                ];
            } else {
                // Return all sessions, including duplicates
                allResults = ids.map((id: string, idx: number) => buildSessionMetadata(id, idx))
                    .filter((session) => session.time !== null);
            }
            return allResults.sort((a, b) => (a.time! < b.time! ? 1 : -1)) as SessionMetadata[];
        });
    }

    async saveSessionLabel(id: string, label: string) {
        await this._redis.hset(this.sessionKey("label"), id, label);
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
            const wasSet = await this._redis.hsetnx(keyFriendlyToMachine, friendly, id);
            if (wasSet) {
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
