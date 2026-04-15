import { NextResponse } from "next/server";
import redis, { isRedisEnabled } from "@/lib/redis";

export async function GET() {
  if (!isRedisEnabled() || !redis) {
    return NextResponse.json({
      success: false,
      error: "REDIS_URL tidak dikonfigurasi",
      hint: 'Tambahkan REDIS_URL di environment variables Coolify',
    }, { status: 500 });
  }

  try {
    // Test ping
    const ping = await redis.ping();

    // Test set/get
    const testKey = "lucentrez:test:connection";
    const testValue = JSON.stringify({ timestamp: Date.now() });

    await redis.set(testKey, testValue, "EX", 60);
    const retrieved = await redis.get(testKey);
    await redis.del(testKey);

    // Get server info
    const info = await redis.info("server");
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    const memory = info.match(/used_memory_human:([^\r\n]+)/)?.[1];
    const connectedClients = info.match(/connected_clients:([^\r\n]+)/)?.[1];

    return NextResponse.json({
      success: true,
      message: "Redis connection OK",
      ping,
      server: {
        version: version || "unknown",
        usedMemory: memory || "unknown",
        connectedClients: connectedClients || "unknown",
      },
      test: {
        set: "OK",
        get: retrieved ? "OK" : "FAILED",
        del: "OK",
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      redisStatus: redis?.status ?? "unavailable",
    }, { status: 500 });
  }
}
