export interface DashboardSummary {
  uploads: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
  };
  reconciliation: {
    total: number;
    matched: number;
    partial: number;
    unmatched: number;
    duplicate: number;
  };
  recentJobs: any[];
}

export interface DashboardFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  uploadedBy?: string;
}
