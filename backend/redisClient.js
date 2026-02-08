// Simple in-memory cache fallback when Redis is not available
const cache = new Map();

const client = {
    get: async (key) => {
        const item = cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
        }
        return item.value;
    },
    setEx: async (key, ttlSeconds, value) => {
        cache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    },
};

console.log("📦 Using in-memory cache (Redis disabled for development)");

export default client;
