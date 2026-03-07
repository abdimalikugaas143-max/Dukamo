const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Core tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'supervisor',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contractors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        company_name TEXT,
        trade TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contractor_agreements (
        id SERIAL PRIMARY KEY,
        contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
        agreement_number TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        scope_of_work TEXT,
        start_date TEXT,
        end_date TEXT,
        contract_value REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        payment_terms TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        special_conditions TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contract_details (
        id SERIAL PRIMARY KEY,
        agreement_id INTEGER NOT NULL REFERENCES contractor_agreements(id) ON DELETE CASCADE,
        item_description TEXT NOT NULL,
        unit TEXT,
        quantity REAL DEFAULT 1,
        unit_price REAL DEFAULT 0,
        total_price REAL DEFAULT 0,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS contractor_payments (
        id SERIAL PRIMARY KEY,
        agreement_id INTEGER NOT NULL REFERENCES contractor_agreements(id) ON DELETE RESTRICT,
        contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
        payment_date TEXT,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'bank_transfer',
        reference_number TEXT,
        milestone_description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        client_name TEXT,
        description TEXT,
        vehicle_type TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        start_date TEXT,
        end_date TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS operational_plans (
        id SERIAL PRIMARY KEY,
        plan_title TEXT NOT NULL,
        plan_type TEXT NOT NULL DEFAULT 'production',
        start_date TEXT,
        end_date TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        objectives TEXT,
        resources_required TEXT,
        assigned_team TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS daily_reports (
        id SERIAL PRIMARY KEY,
        report_date TEXT NOT NULL,
        shift TEXT NOT NULL DEFAULT 'day',
        supervisor_name TEXT NOT NULL,
        supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        vehicle_code TEXT,
        vehicle_type TEXT,
        production_summary TEXT,
        quality_issues TEXT,
        safety_incidents TEXT,
        equipment_status TEXT,
        weather_conditions TEXT,
        notes TEXT,
        review_status TEXT NOT NULL DEFAULT 'submitted',
        review_notes TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS monthly_reports (
        id SERIAL PRIMARY KEY,
        report_month TEXT NOT NULL UNIQUE,
        prepared_by TEXT NOT NULL,
        total_units_produced INTEGER DEFAULT 0,
        total_contracts_value REAL DEFAULT 0,
        active_contractors INTEGER DEFAULT 0,
        production_highlights TEXT,
        challenges TEXT,
        recommendations TEXT,
        financial_summary TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_contractors (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
        role TEXT,
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(project_id, contractor_id)
      );
    `);

    // Safe migrations for existing deployments
    await client.query(`
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS vehicle_code TEXT;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'submitted';
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS review_notes TEXT;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
      ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
    `);

    console.log('Database migrations applied successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    client.release();
  }
}

migrate().catch(console.error);

module.exports = pool;
