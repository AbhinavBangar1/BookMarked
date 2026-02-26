import redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const mockClient = {
    get: async () => null,
    setEx: async () => { },
    isReady: false,
};

let client = mockClient;

const connectRedis = async () => {
    try {
        const redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: { connectTimeout: 3000 }
        });

        redisClient.on("error", () => { });

        await redisClient.connect();
        client = redisClient;
        console.log("Connected to Redis");
    } catch (err) {
        console.warn("Redis not available - using in-memory fallback");
    }
};

connectRedis();

export default {
    get: async (key) => client.get(key),
    setEx: async (key, ttl, value) => client.setEx(key, ttl, value),
};
