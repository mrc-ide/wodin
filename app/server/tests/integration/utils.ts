import axios from "axios";
import Redis from "ioredis";

const fullUrl = (url: string) => `http://localhost:3000/${url}`;
const redisUrl = "redis://localhost:6379";

export const post = async (url: string, body: any) => {
    const headers = { "Content-Type": "application/json" };
    const response = await axios.post(fullUrl(url), body, { headers });
    return response;
};

export const getRedisValue = async (key: string, field: string) => {
    const redis = new Redis(redisUrl);
    return redis.hget(key, field);
};

export const expectRedisJSONValue = async (key: string, field: string, expectedValue: any) => {
    const value = await getRedisValue(key, field);
    expect(JSON.parse(value!)).toStrictEqual(expectedValue);
};

export const flushRedis = async () => {
    const redis = new Redis(redisUrl);
    await redis.flushdb();
};
