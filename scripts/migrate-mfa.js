// Migration: add MFA columns to shepherd_profiles
// Run: node scripts/migrate-mfa.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  // Add MFA columns using raw SQL via the management API
  const sql = `
    ALTER TABLE shepherd_profiles 
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

    ALTER TABLE shepherd_profiles 
    ADD COLUMN IF NOT EXISTS totp_secret TEXT;

    ALTER TABLE shepherd_profiles 
    ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

    ALTER TABLE shepherd_profiles 
    ADD COLUMN IF NOT EXISTS mfa_verified_at TIMESTAMPTZ;
  `;

  // Use Supabase's SQL API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    if (err.includes("already exists") || err.includes("duplicate column")) {
      console.log("Columns already exist — OK");
    } else {
      console.log(`Status: ${res.status}, trying direct approach...`);
      // Try individual ALTER TABLE statements
      const cols = [
        "mfa_enabled BOOLEAN DEFAULT false",
        "totp_secret TEXT",
        "backup_codes TEXT[]",
        "mfa_verified_at TIMESTAMPTZ",
      ];
      for (const col of cols) {
        const single = `ALTER TABLE shepherd_profiles ADD COLUMN IF NOT EXISTS ${col};`;
        const r = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({ sql: single }),
          }
        );
        const t = await r.text();
        console.log(`  ${col.split(" ")[0]}: ${r.status} ${t.slice(0, 80)}`);
      }
    }
  } else {
    console.log("Migration complete:", await res.text());
  }

  // Verify
  const { data, error } = await admin
    .from("shepherd_profiles")
    .select("id")
    .limit(1);
  console.log("Table OK:", !error, error?.message || "");
}

migrate();
