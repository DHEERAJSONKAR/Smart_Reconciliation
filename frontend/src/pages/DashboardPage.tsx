import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';
import { StatCard } from '@/components/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber, formatPercentage } from '@/utils/format';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch dashboard summary data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: () => dashboardApi.getSummary(dateRange.startDate ? dateRange : undefined),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    toast.error('Failed to load dashboard data');
    return (
      <EmptyState
        icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        title="Error Loading Data"
        description="Failed to load dashboard data. Please try again."
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  const summary = data?.data;
  if (!summary) return null;

  // Extract reconciliation and upload stats with fallback values
  const reconciliation = summary.reconciliation || { matched: 0, partial: 0, unmatched: 0, duplicate: 0, total: 0 };
  const uploads = summary.uploads || { total: 0, completed: 0, processing: 0, failed: 0 };
  const totalRecords = reconciliation.total || 0;
  const matchedRecords = reconciliation.matched || 0;
  // Calculate matching accuracy percentage
  const accuracy = totalRecords > 0 ? (matchedRecords / totalRecords) * 100 : 0;

  const pieData = [
    { name: 'Matched', value: reconciliation.matched, color: '#22c55e' },
    { name: 'Partial', value: reconciliation.partial, color: '#f59e0b' },
    { name: 'Unmatched', value: reconciliation.unmatched, color: '#ef4444' },
    { name: 'Duplicate', value: reconciliation.duplicate, color: '#a855f7' },
  ];

  const barData = [
    { name: 'Completed', value: uploads.completed },
    { name: 'Processing', value: uploads.processing },
    { name: 'Failed', value: uploads.failed },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of reconciliation metrics</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Uploads"
          value={formatNumber(uploads.total)}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="primary"
        />
        <StatCard
          title="Completed"
          value={formatNumber(uploads.completed)}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="success"
        />
        <StatCard
          title="Failed"
          value={formatNumber(uploads.failed)}
          icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="danger"
        />
        <StatCard
          title="Accuracy"
          value={formatPercentage(accuracy)}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        {barData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trends Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Partial Matches</p>
              <p className="text-2xl font-bold text-warning-600 mt-2">{formatNumber(reconciliation.partial)}</p>
            </div>
            <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duplicates</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(reconciliation.duplicate)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">{formatNumber(uploads.processing)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
