import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uploadApi } from '@/api/upload';
import { reconciliationApi } from '@/api/reconciliation';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate} from '@/utils/format';

export const ReconciliationPage: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const { data: uploads } = useQuery({
    queryKey: ['uploads-for-reconciliation'],
    queryFn: () => uploadApi.getAll({ status: 'COMPLETED', limit: 50 }),
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['reconciliation', selectedJobId],
    queryFn: () => reconciliationApi.getByUploadJob(selectedJobId),
    enabled: !!selectedJobId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reconciliation</h1>
        <p className="text-gray-600 mt-1">Review and manage reconciliation results</p>
      </div>

      {/* Job Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Upload Job</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Choose a completed upload...</option>
          {uploads?.data.jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.fileName} - {formatDate(job.createdAt)}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {selectedJobId && (
        <>
          {isLoading ? (
            <LoadingSpinner />
          ) : results?.data.results.length === 0 ? (
            <EmptyState
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              title="No results yet"
              description="This job hasn't been reconciled yet"
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Match Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results?.data.results.map((result: any) => (
                      <tr key={result._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.record.transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(result.record.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(result.record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={result.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(result.matchScore * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedRecord(result)}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedRecord.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRecord.record.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedRecord.record.amount)}</p>
                </div>
              </div>

              {selectedRecord.mismatches?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mismatches</label>
                  <div className="space-y-2">
                    {selectedRecord.mismatches.map((mismatch: any, index: number) => (
                      <div key={index} className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{mismatch.field}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Source: </span>
                            <span className="text-gray-900">{JSON.stringify(mismatch.sourceValue)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Target: </span>
                            <span className="text-gray-900">{JSON.stringify(mismatch.targetValue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
