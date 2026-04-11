/**
 * Debug RLS Policies
 * Shows what policies currently exist and whether they're blocking correctly
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log("\n🔍 RLS Policies Debug\n");

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Get all policies on products table
  console.log("📋 Current Policies on 'products' table:");
  console.log("────────────────────────────────────────");

  let policies: unknown = null;
  let error: unknown = null;
  try {
    const result = await adminClient.rpc("get_policies", {
      table_name: "products",
    } as any);
    policies = result.data;
    error = result.error;
  } catch {
    policies = null;
    error = "RPC not available";
  }

  if (error || !policies) {
    console.log("⚠️  Cannot query via RPC. Policies information:");
    console.log("   - Run this SQL in Supabase Dashboard:");
    console.log("   SELECT * FROM pg_policies WHERE tablename = 'products';\n");
  } else {
    console.table(policies);
  }

  // Try to test UPDATE directly
  console.log("\n🧪 Testing UPDATE Block:");
  console.log("────────────────────────");

  const { data: products } = await adminClient
    .from("products")
    .select("id")
    .limit(1);

  if (products && products.length > 0) {
    const testId = products[0].id;
    console.log(`Testing with product ID: ${testId}\n`);

    // Try with anon key
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error: updateError } = await anonClient
      .from("products")
      .update({ name: "HACKED" })
      .eq("id", testId);

    if (updateError) {
      console.log("✅ UPDATE BLOCKED (Good!)");
      console.log(`Error: ${updateError.message}`);
    } else {
      console.log("❌ UPDATE WAS ALLOWED (Bad!)");
      console.log("RLS Policy is NOT working");

      // Check what role the anon user has
      let roleData: unknown = null;
      try {
        const result = await anonClient.rpc("get_session_user", {} as any);
        roleData = result.data;
      } catch {
        roleData = null;
      }

      if (roleData) {
        console.log(`Current user role: ${JSON.stringify(roleData)}`);
      }
    }
  } else {
    console.log("⚠️  No products found to test with");
  }

  // Check RLS status
  console.log("\n📊 RLS Status:");
  console.log("──────────────");

  let rlsStatus: unknown = null;
  try {
    const result = await adminClient.rpc("get_rls_status", {} as any);
    rlsStatus = result.data;
  } catch {
    rlsStatus = null;
  }

  if (!rlsStatus) {
    console.log("Run this SQL to check RLS status:");
    console.log("  SELECT tablename, rowsecurity FROM pg_tables");
    console.log("  WHERE schemaname = 'public';");
  } else {
    console.table(rlsStatus);
  }
}

main().catch(console.error);
