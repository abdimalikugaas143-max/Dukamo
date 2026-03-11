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
    // Core users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'worker',
        is_active BOOLEAN NOT NULL DEFAULT true,
        user_type TEXT DEFAULT 'dukamo',
        profile_complete BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        phone TEXT,
        phone_verified BOOLEAN DEFAULT false,
        country TEXT DEFAULT 'Ethiopia',
        language TEXT DEFAULT 'en',
        referral_code TEXT UNIQUE,
        referred_by INTEGER REFERENCES users(id),
        verification_code TEXT,
        verification_expires TIMESTAMPTZ,
        reset_code TEXT,
        reset_code_expires TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Dukamo marketplace tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS worker_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        location TEXT,
        country TEXT DEFAULT 'Ethiopia',
        skills TEXT,
        experience_years INTEGER DEFAULT 0,
        hourly_rate REAL,
        currency TEXT DEFAULT 'ETB',
        availability TEXT DEFAULT 'available',
        portfolio_url TEXT,
        rating REAL DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        id_verified BOOLEAN DEFAULT false,
        open_to_remote_international BOOLEAN DEFAULT false,
        english_level TEXT DEFAULT 'basic',
        timezone TEXT DEFAULT 'Africa/Addis_Ababa',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT NOT NULL,
        industry TEXT,
        location TEXT,
        country TEXT DEFAULT 'Ethiopia',
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
        country TEXT DEFAULT 'Ethiopia',
        is_remote BOOLEAN DEFAULT false,
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
        country TEXT DEFAULT 'Ethiopia',
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
        payment_method TEXT DEFAULT 'bank_transfer',
        reference TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES job_posts(id),
        gig_id INTEGER REFERENCES gig_tasks(id),
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reward_paid BOOLEAN DEFAULT false,
        reward_amount REAL DEFAULT 50,
        currency TEXT DEFAULT 'ETB',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(referred_id)
      );

      CREATE TABLE IF NOT EXISTS worker_loans (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        gig_id INTEGER REFERENCES gig_tasks(id),
        status TEXT DEFAULT 'active',
        repaid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employer_team_members (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'recruiter',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(employer_id, user_id)
      );
    `);

    // Safe column additions for existing deployments
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ethiopia';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'dukamo';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMPTZ;

      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ethiopia';
      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ETB';
      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false;
      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS open_to_remote_international BOOLEAN DEFAULT false;
      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS english_level TEXT DEFAULT 'basic';
      ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Addis_Ababa';

      ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ethiopia';
      ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ethiopia';
      ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;
      ALTER TABLE gig_tasks ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ethiopia';

      ALTER TABLE platform_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank_transfer';
      ALTER TABLE platform_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    // Mark admin accounts as verified
    await client.query(`
      UPDATE users SET email_verified = true
      WHERE role IN ('admin', 'ops', 'supervisor') AND email_verified = false;
    `);

    console.log('Dukamo database migrations applied successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    client.release();
  }
}

migrate().catch(console.error);

module.exports = pool;
