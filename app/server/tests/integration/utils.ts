import axios from "axios";
import Redis from "ioredis";

const fullUrl = (url: string) => `http://localhost:3000/${url}`;
const redisUrl = "redis://localhost:6379";

export const post = async (url: string, body: any, contentType: string = "application/json") => {
    const headers = { "Content-Type": contentType };
    return axios.post(fullUrl(url), body, { headers });
};

export const get = async (url: string) => {
    const headers = { "Content-Type": "application/json" };
    return axios.get(fullUrl(url), { headers, validateStatus: () => true });
};

const withRedis = async (func: (redis: Redis) => any) => {
    const redis = new Redis(redisUrl);
    try {
        return await func(redis);
    } finally {
        redis.disconnect();
    }
};

export const getRedisValue = async (key: string, field: string) => {
    return withRedis((redis: Redis) => {
        return redis.hget(key, field);
    });
};

export const setRedisValue = async (key: string, field: string, value: string) => {
    await withRedis(async (redis: Redis) => {
        await redis.hset(key, field, value);
    });
};

export const expectRedisJSONValue = async (key: string, field: string, expectedValue: any) => {
    const value = await getRedisValue(key, field);
    expect(JSON.parse(value!)).toStrictEqual(expectedValue);
};

export const flushRedis = async () => {
    await withRedis(async (redis: Redis) => {
        await redis.flushdb();
    });
};
