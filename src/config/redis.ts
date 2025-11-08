import Redis from "ioredis";
import { config } from "./env.js";

export const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    lazyConnect: false
});

redis.on('connect', () => console.log(' Redis client connected'));
redis.on('ready', () => console.log(' Redis client ready'));
redis.on('error', (err) => console.error('Redis connection error:', err));
redis.on('close', () => console.log(' Redis client closed'));
redis.on('reconnecting', () => console.log(' Redis client reconnecting'));

redis.ping().then(() => {
    console.log(' Redis ping successful');
}).catch((err) => {
    console.error(' Redis ping failed:', err);
});