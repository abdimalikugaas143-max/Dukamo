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
  production_summary?: string;
  units_produced: number;
  quality_issues?: string;
  safety_incidents?: string;
  equipment_status?: string;
  weather_conditions?: string;
  attendance_count: number;
  notes?: string;
  operational_plan_id?: number;
  plan_title?: string;
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

export interface DashboardData {
  stats: {
    activeContractors: number;
    activeAgreements: number;
    totalContractValue: number;
    pendingPayments: number;
    pendingPaymentsAmount: number;
    overduePayments: number;
    activePlans: number;
    pendingReviews: number;
  };
  recentDailyReports: DailyReport[];
  expiringContracts: ContractorAgreement[];
  paymentsByStatus: { status: string; count: number; total: number }[];
}
