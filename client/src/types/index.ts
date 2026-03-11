// ── Dukamo Marketplace Types ─────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'worker' | 'employer' | 'admin';
  user_type: string;
  profile_complete: boolean;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  country?: string;
  language?: string;
  referral_code?: string;
  created_at: string;
}

export interface WorkerProfile {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  country?: string;
  skills?: string;
  experience_years: number;
  hourly_rate?: number;
  currency?: string;
  availability: 'available' | 'busy' | 'unavailable';
  portfolio_url?: string;
  rating: number;
  total_reviews: number;
  verified: boolean;
  id_verified?: boolean;
  open_to_remote_international?: boolean;
  english_level?: string;
  timezone?: string;
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
  country?: string;
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
  country?: string;
  is_remote?: boolean;
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
  country?: string;
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
  earned_at?: string;
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
  user_name?: string;
  type: string;
  amount: number;
  currency: string;
  payment_method?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  sender_name?: string;
  other_user_id?: number;
  other_user_name?: string;
  other_user_role?: string;
  job_id?: number;
  gig_id?: number;
  content: string;
  read: boolean;
  unread_count?: number;
  created_at: string;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  referred_name?: string;
  referred_email?: string;
  joined_at?: string;
  reward_paid: boolean;
  reward_amount: number;
  currency: string;
  created_at: string;
}

export interface DukamoDashboard {
  totalJobs: number;
  activeJobs: number;
  totalGigs: number;
  openGigs: number;
  totalWorkers: number;
  verifiedWorkers: number;
  totalEmployers: number;
  totalApplications: number;
  totalBids: number;
  totalMessages: number;
  confirmedRevenue: number;
  totalGmv: number;
  totalTransactions: number;
  topCategories: { category: string; count: number }[];
  countryStats: { country: string; users: number }[];
  recentJobs: JobPost[];
  recentGigs: GigTask[];
}

export interface MatchResult {
  worker_id?: number;
  job_id?: number;
  name?: string;
  title?: string;
  match_score: number;
  skills?: string;
  rating?: number;
  company?: string;
  currency?: string;
  country?: string;
}
