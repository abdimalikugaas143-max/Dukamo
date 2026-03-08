export interface Contractor {
  id: number;
  name: string;
  company_name?: string;
  trade: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
}

export interface ContractorAgreement {
  id: number;
  contractor_id: number;
  contractor_name?: string;
  company_name?: string;
  contractor_phone?: string;
  contractor_email?: string;
  contractor_address?: string;
  agreement_number: string;
  title: string;
  scope_of_work?: string;
  start_date?: string;
  end_date?: string;
  contract_value: number;
  currency: string;
  payment_terms?: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  special_conditions?: string;
  details?: ContractDetail[];
  created_at: string;
  updated_at: string;
}

export interface ContractDetail {
  id: number;
  agreement_id: number;
  item_description: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface ContractorPayment {
  id: number;
  agreement_id: number;
  contractor_id: number;
  contractor_name?: string;
  agreement_number?: string;
  agreement_title?: string;
  payment_date?: string;
  amount: number;
  payment_method: 'bank_transfer' | 'cheque' | 'cash';
  reference_number?: string;
  milestone_description?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
}

export interface OperationalPlan {
  id: number;
  plan_title: string;
  plan_type: 'production' | 'assembly' | 'maintenance' | 'delivery' | 'quality';
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'active' | 'completed';
  objectives?: string;
  resources_required?: string;
  assigned_team?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReport {
  id: number;
  report_date: string;
  shift: 'day' | 'night';
  supervisor_name: string;
  supervisor_id?: number;
  project_id?: number;
  project_title?: string;
  project_code?: string;
  vehicle_code?: string;
  vehicle_type?: string;
  production_summary?: string;
  quality_issues?: string;
  safety_incidents?: string;
  equipment_status?: string;
  weather_conditions?: string;
  notes?: string;
  review_status: 'submitted' | 'approved' | 'rejected';
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface MonthlyReport {
  id: number;
  report_month: string;
  prepared_by: string;
  total_units_produced: number;
  total_contracts_value: number;
  active_contractors: number;
  production_highlights?: string;
  challenges?: string;
  recommendations?: string;
  financial_summary?: string;
  created_at: string;
  updated_at: string;
}

// ── Dukamo Marketplace ─────────────────────────────────────────────────────

export interface WorkerProfile {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  skills?: string;
  experience_years: number;
  hourly_rate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  portfolio_url?: string;
  rating: number;
  total_reviews: number;
  verified: boolean;
  created_at: string;
}

export interface EmployerProfile {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  company_name: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  verified: boolean;
  total_posted: number;
  created_at: string;
}

export interface JobPost {
  id: number;
  employer_id: number;
  company_name?: string;
  employer_location?: string;
  title: string;
  description: string;
  category: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'remote';
  location?: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  skills_required?: string;
  experience_level: 'entry' | 'mid' | 'senior';
  status: 'active' | 'closed' | 'draft';
  deadline?: string;
  views: number;
  application_count?: number;
  employer_verified?: boolean;
  employer_desc?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  worker_id: number;
  job_title?: string;
  company_name?: string;
  worker_name?: string;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  updated_at: string;
}

export interface GigTask {
  id: number;
  poster_id: number;
  poster_name?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  currency: string;
  location?: string;
  is_remote: boolean;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assigned_worker_id?: number;
  bid_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GigBid {
  id: number;
  task_id: number;
  worker_id: number;
  worker_name?: string;
  worker_rating?: number;
  task_title?: string;
  bid_amount: number;
  proposal?: string;
  delivery_days?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface SkillBadge {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  icon?: string;
  earned?: boolean;
}

export interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_name?: string;
  task_id?: number;
  job_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface PlatformTransaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  currency: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface DukamoDashboard {
  totalJobs: number;
  totalGigs: number;
  totalWorkers: number;
  totalEmployers: number;
  openGigs: number;
  activeJobs: number;
  totalApplications: number;
  totalBids: number;
  topCategories: { category: string; count: number }[];
  recentJobs: JobPost[];
  recentGigs: GigTask[];
}

export interface DashboardData {
  stats: {
    activeContractors: number;
    activeAgreements: number;
    totalContractValue: number;
    pendingPayments: number;
    pendingPaymentsAmount: number;
    overduePayments: number;
    pendingReviews: number;
    projectStats: { pending: number; ongoing: number; completed: number };
  };
  recentDailyReports: DailyReport[];
  expiringContracts: ContractorAgreement[];
  paymentsByStatus: { status: string; count: number; total: number }[];
  vehicleActivity: { vehicle_type: string; count: number }[];
}
