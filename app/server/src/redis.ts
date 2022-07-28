import Redis from "ioredis";

export function redisConnection(url: string): Redis {
    const redis = new Redis(url);
    redis.on("error", (err) => {
        console.log(err);
        throw Error(`Failed to connect to redis server ${url}`);
    });
    redis.on("connect", () => {
        console.log(`Connected to Redis server ${url}`);
    });
    return redis;
}
