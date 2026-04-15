import Redis from "ioredis";

async function testRedis() {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!redisUrl) {
    console.error("❌ REDIS_URL tidak ditemukan di environment variables");
    console.log("\nTambahkan ke .env:");
    console.log('REDIS_URL="redis://localhost:6379"');
    console.log("\nUntuk Redis dengan password:");
    console.log('REDIS_URL="redis://:password@localhost:6379"');
    process.exit(1);
  }

  console.log("🔌 Connecting to Redis...");
  console.log(`📍 URL: ${redisUrl.replace(/:[^:@]+@/, ":****@")}`);

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
  });

  try {
    // Test connection
    const ping = await redis.ping();
    console.log(`✅ PING: ${ping}`);

    // Test SET/GET
    const testKey = "lucentrez:test:key";
    const testValue = JSON.stringify({ message: "Hello Redis!", timestamp: Date.now() });

    await redis.set(testKey, testValue, "EX", 60);
    console.log("✅ SET: OK");

    const retrieved = await redis.get(testKey);
    console.log(`✅ GET: ${retrieved}`);

    // Test DELETE
    await redis.del(testKey);
    console.log("✅ DEL: OK");

    // Test TTL
    await redis.set("lucentrez:test:ttl", "will expire", "EX", 10);
    const ttl = await redis.ttl("lucentrez:test:ttl");
    console.log(`✅ TTL: ${ttl} seconds remaining`);
    await redis.del("lucentrez:test:ttl");

    // Get info
    const info = await redis.info("server");
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const usedMemory = info.match(/used_memory_human:([^\r\n]+)/);
    console.log(`📊 Redis Version: ${versionMatch?.[1] || "unknown"}`);
    console.log(`📊 Used Memory: ${usedMemory?.[1] || "unknown"}`);

    console.log("\n🎉 Semua test Redis berhasil!");
  } catch (error) {
    console.error("❌ Redis test gagal:", error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

testRedis();
