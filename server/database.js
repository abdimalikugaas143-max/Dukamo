const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
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
        production_summary TEXT,
        units_produced INTEGER DEFAULT 0,
        quality_issues TEXT,
        safety_incidents TEXT,
        equipment_status TEXT,
        weather_conditions TEXT,
        attendance_count INTEGER DEFAULT 0,
        notes TEXT,
        operational_plan_id INTEGER REFERENCES operational_plans(id) ON DELETE SET NULL,
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
    `);
    console.log('Database migrations applied successfully');
  } finally {
    client.release();
  }
}

migrate().catch(console.error);

module.exports = pool;
