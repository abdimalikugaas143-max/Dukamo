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

    // Dukamo marketplace tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS worker_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        location TEXT,
        skills TEXT,
        experience_years INTEGER DEFAULT 0,
        hourly_rate REAL,
        availability TEXT DEFAULT 'available',
        portfolio_url TEXT,
        rating REAL DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT NOT NULL,
        industry TEXT,
        location TEXT,
        website TEXT,
        description TEXT,
        verified BOOLEAN DEFAULT false,
        total_posted INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_posts (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        job_type TEXT DEFAULT 'full_time',
        location TEXT,
        salary_min REAL,
        salary_max REAL,
        currency TEXT DEFAULT 'ETB',
        skills_required TEXT,
        experience_level TEXT DEFAULT 'entry',
        status TEXT DEFAULT 'active',
        deadline TEXT,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
        worker_id INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        cover_letter TEXT,
        status TEXT DEFAULT 'pending',
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(job_id, worker_id)
      );

      CREATE TABLE IF NOT EXISTS gig_tasks (
        id SERIAL PRIMARY KEY,
        poster_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        budget REAL NOT NULL,
        currency TEXT DEFAULT 'ETB',
        location TEXT,
        is_remote BOOLEAN DEFAULT false,
        deadline TEXT,
        status TEXT DEFAULT 'open',
        assigned_worker_id INTEGER REFERENCES worker_profiles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gig_bids (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES gig_tasks(id) ON DELETE CASCADE,
        worker_id INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        bid_amount REAL NOT NULL,
        proposal TEXT,
        delivery_days INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(task_id, worker_id)
      );

      CREATE TABLE IF NOT EXISTS skill_badges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS worker_badges (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        badge_id INTEGER NOT NULL REFERENCES skill_badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(worker_id, badge_id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER NOT NULL REFERENCES users(id),
        reviewee_id INTEGER NOT NULL REFERENCES users(id),
        task_id INTEGER REFERENCES gig_tasks(id),
        job_id INTEGER REFERENCES job_posts(id),
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS platform_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'ETB',
        reference TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Dukamo user-type extensions
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'ops';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMPTZ;
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
