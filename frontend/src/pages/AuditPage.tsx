import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/audit';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDateTime } from '@/utils/format';

export const AuditPage: React.FC = () => {
  const [entityType, setEntityType] = useState('ReconciliationResult');
  const [entityId, setEntityId] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit', entityType, entityId],
    queryFn: () => auditApi.getLogs({ entityType, entityId: entityId || undefined, limit: 50 }),
    enabled: !!entityType,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-600 mt-1">Immutable change history and audit logs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ReconciliationResult">Reconciliation Result</option>
              <option value="Record">Record</option>
              <option value="UploadJob">Upload Job</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID (Optional)</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Leave empty for all entities"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <LoadingSpinner />
      ) : logs?.data.logs.length === 0 ? (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          title="No audit logs"
          description="No audit logs found for the selected criteria"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {logs?.data.logs.map((log) => (
                <div key={log._id} className="relative flex items-start space-x-4 pl-12">
                  <div className="absolute left-2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white"></div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {log.action}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-2">
                            Changed by: {log.changedBy.email}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</span>
                      </div>

                      {log.oldValue && log.newValue && (
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Old Value:</p>
                            <pre className="bg-white p-2 rounded border border-gray-200 text-xs overflow-x-auto">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">New Value:</p>
                            <pre className="bg-white p-2 rounded border border-gray-200 text-xs overflow-x-auto">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Source: {log.source}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
