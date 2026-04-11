/**
 * Supabase Connection Test Script
 * Run this to verify connection and RLS security
 * 
 * Usage: npx ts-node test-supabase-connection.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TESTS = {
  CONNECTION: "Connection",
  READ_PRODUCTS: "Read Products (Public)",
  INSERT_PRODUCTS: "Insert Products (Public - Should Fail)",
  UPDATE_PRODUCTS: "Update Products (Public - Should Fail)",
  DELETE_PRODUCTS: "Delete Products (Public - Should Fail)",
  ADMIN_READ: "Admin Read (Service Key)",
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

function isExpectedBlockedWriteError(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes("row-level security") ||
    msg.includes("row level security") ||
    msg.includes("permission denied") ||
    msg.includes("not allowed")
  );
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({
      name,
      passed: true,
      message: "✓ Passed",
      duration: Date.now() - start,
    });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function main() {
  console.log("\n🔍 SUPABASE SECURITY AUDIT\n");
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Has Anon Key: ${!!supabaseAnonKey}`);
  console.log(`Has Service Key: ${!!supabaseServiceKey}`);
  console.log("\n─────────────────────────────────────\n");

  // Test 1: Connection with anon key
  await runTest(TESTS.CONNECTION, async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client.from("products").select("count");

    if (error) throw new Error(`Connection failed: ${error.message}`);
  });

  // Test 2: Public read access (should work)
  await runTest(TESTS.READ_PRODUCTS, async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from("products")
      .select("id, name")
      .limit(1);

    if (error) throw new Error(`Read failed: ${error.message}`);
  });

  // Test 3: Public insert (should fail with RLS)
  await runTest(TESTS.INSERT_PRODUCTS, async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await client.from("products").insert({
      name: "Test Product",
      slug: "test-product",
      price: 100,
      description: "This should fail due to RLS",
      images: [],
      shopeeurl: "https://shopee.com",
      category: "test",
    });

    // This SHOULD fail - if it doesn't, RLS is not properly configured
    if (!error) {
      throw new Error(
        "RLS POLICY FAILED: Insert was allowed! This should not happen."
      );
    }

    // Expected: blocked by either RLS or table privileges
    if (isExpectedBlockedWriteError(error.message)) {
      // Good - RLS is working
      return;
    }

    throw new Error(`Unexpected error: ${error.message}`);
  });

  // Test 4: Public update (should fail with RLS)
  await runTest(TESTS.UPDATE_PRODUCTS, async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    // First get an ID
    const { data: products } = await client
      .from("products")
      .select("id")
      .limit(1);

    if (!products || products.length === 0) {
      console.log("  (No products to test update, skipping)");
      return;
    }

    const { error } = await client
      .from("products")
      .update({ name: "Hacked" })
      .eq("id", products[0].id);

    if (!error) {
      throw new Error(
        "RLS POLICY FAILED: Update was allowed! This should not happen."
      );
    }

    if (isExpectedBlockedWriteError(error.message)) {
      return;
    }

    throw new Error(`Unexpected error: ${error.message}`);
  });

  // Test 5: Public delete (should fail with RLS)
  await runTest(TESTS.DELETE_PRODUCTS, async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    // First get an ID
    const { data: products } = await client
      .from("products")
      .select("id")
      .limit(1);

    if (!products || products.length === 0) {
      console.log("  (No products to test delete, skipping)");
      return;
    }

    const { error } = await client
      .from("products")
      .delete()
      .eq("id", products[0].id);

    if (!error) {
      throw new Error(
        "RLS POLICY FAILED: Delete was allowed! This should not happen."
      );
    }

    if (isExpectedBlockedWriteError(error.message)) {
      return;
    }

    throw new Error(`Unexpected error: ${error.message}`);
  });

  // Test 6: Admin operations (service key)
  await runTest(TESTS.ADMIN_READ, async () => {
    if (!supabaseServiceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("products")
      .select("count");

    if (error) throw new Error(`Admin read failed: ${error.message}`);
  });

  // Print summary
  console.log("\n─────────────────────────────────────\n");
  console.log("📊 TEST SUMMARY\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? "✓" : "✗";
    console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`);
  });

  console.log(`\n✓ Passed: ${passed}/${results.length}`);
  console.log(`✗ Failed: ${failed}/${results.length}`);

  if (failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED - Ready for production!");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED - Review configuration before production");
    process.exit(1);
  }
}

main().catch(console.error);
