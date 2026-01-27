export interface ReconciliationRule {
  name: string;
  priority: number;
  enabled: boolean;
  matchCriteria: {
    fields: string[];
    amountVariance?: number;
  };
}

export const reconciliationRules: ReconciliationRule[] = [
  {
    name: 'EXACT_MATCH',
    priority: 1,
    enabled: true,
    matchCriteria: {
      fields: ['transactionId', 'amount'],
    },
  },
  {
    name: 'PARTIAL_MATCH',
    priority: 2,
    enabled: true,
    matchCriteria: {
      fields: ['referenceNumber'],
      amountVariance: 0.02, // ±2%
    },
  },
  {
    name: 'DUPLICATE_DETECTION',
    priority: 3,
    enabled: true,
    matchCriteria: {
      fields: ['transactionId'],
    },
  },
];

export const getRuleByName = (name: string): ReconciliationRule | undefined => {
  return reconciliationRules.find((rule) => rule.name === name && rule.enabled);
};

export const getActiveRules = (): ReconciliationRule[] => {
  return reconciliationRules
    .filter((rule) => rule.enabled)
    .sort((a, b) => a.priority - b.priority);
};
