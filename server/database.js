const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ops_management.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      trade TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contractor_agreements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contractor_id INTEGER NOT NULL,
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS contract_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agreement_id INTEGER NOT NULL,
      item_description TEXT NOT NULL,
      unit TEXT,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      total_price REAL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (agreement_id) REFERENCES contractor_agreements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contractor_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agreement_id INTEGER NOT NULL,
      contractor_id INTEGER NOT NULL,
      payment_date TEXT,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'bank_transfer',
      reference_number TEXT,
      milestone_description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agreement_id) REFERENCES contractor_agreements(id) ON DELETE RESTRICT,
      FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS operational_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_title TEXT NOT NULL,
      plan_type TEXT NOT NULL DEFAULT 'production',
      start_date TEXT,
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      objectives TEXT,
      resources_required TEXT,
      assigned_team TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      operational_plan_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (operational_plan_id) REFERENCES operational_plans(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_month TEXT NOT NULL UNIQUE,
      prepared_by TEXT NOT NULL,
      total_units_produced INTEGER DEFAULT 0,
      total_contracts_value REAL DEFAULT 0,
      active_contractors INTEGER DEFAULT 0,
      production_highlights TEXT,
      challenges TEXT,
      recommendations TEXT,
      financial_summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('Database migrations applied successfully');
}

migrate();

module.exports = db;
