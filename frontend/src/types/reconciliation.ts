export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  PARTIAL = 'PARTIAL',
  UNMATCHED = 'UNMATCHED',
  DUPLICATE = 'DUPLICATE',
}

export interface ReconciliationResult {
  _id: string;
  recordId: string;
  uploadJobId: string;
  status: ReconciliationStatus;
  matchedWith?: string;
  matchScore: number;
  mismatches: Array<{
    field: string;
    sourceValue: any;
    targetValue: any;
  }>;
  record: {
    transactionId: string;
    referenceNumber: string;
    amount: number;
    date: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationFilter {
  status?: ReconciliationStatus;
  matchScore?: number;
  page?: number;
  limit?: number;
}
