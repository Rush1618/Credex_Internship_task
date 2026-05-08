import { Client } from 'pg';

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres:u9M6v5KrOadqffkP@db.jfzkvlyjuqufpusnhgkk.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to Postgres. Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        id BIGSERIAL PRIMARY KEY,
        uuid UUID UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        audit_input JSONB NOT NULL,
        audit_result JSONB NOT NULL,
        total_monthly_savings NUMERIC,
        total_annual_savings NUMERIC,
        ai_summary TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        email TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        audit_uuid UUID REFERENCES audits(uuid),
        is_high_savings BOOLEAN DEFAULT FALSE
      );
    `);

    console.log('✅ Tables "audits" and "leads" created/verified.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
