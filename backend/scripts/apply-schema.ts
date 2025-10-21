import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in the environment. Aborting.');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), 'database-schema.sql');
  console.log(`Applying database schema from: ${sqlPath}`);

  const sql = await readFile(sqlPath, 'utf8');

  // Enable SSL automatically for common managed providers like Supabase,
  // or when explicitly requested with DATABASE_SSL=true
  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    /supabase\.com/i.test(databaseUrl) ||
    /pooler\.supabase\.com/i.test(databaseUrl);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Run the entire schema in a single transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('Database schema applied successfully ✅');
  } catch (err: any) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    console.error('Error applying database schema:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
