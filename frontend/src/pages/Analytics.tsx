import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Calendar, Clock, CheckCircle } from 'lucide-react';
import { reportAPI } from '../api/client';

export const Analytics = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', thirtyDaysAgo, today],
    queryFn: async () => {
      const { data } = await reportAPI.getAnalytics(
        thirtyDaysAgo.toISOString(),
        today.toISOString()
      );
      return data.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Days Tracked</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.totalReports}</p>
            </div>
            <Calendar className="text-primary" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Planned Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((analytics?.totalPlanned || 0) / 60)}h
              </p>
            </div>
            <Clock className="text-warning" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Completed Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((analytics?.totalActual || 0) / 60)}h
              </p>
            </div>
            <CheckCircle className="text-success" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(analytics?.averageCompletionRate || 0)}%
              </p>
            </div>
            <TrendingUp className="text-secondary" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Summary</h2>
        <p className="text-gray-600">
          In the last 30 days, you've planned an average of{' '}
          <span className="font-semibold">
            {analytics?.totalReports ? Math.round((analytics?.totalPlanned || 0) / (analytics?.totalReports * 60)) : 0} hours
          </span>{' '}
          per day and completed{' '}
          <span className="font-semibold">
            {analytics?.totalReports ? Math.round((analytics?.totalActual || 0) / (analytics?.totalReports * 60)) : 0} hours
          </span>{' '}
          on average.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Suggestion</h3>
        <p className="text-blue-800">
          {analytics?.averageCompletionRate && analytics.averageCompletionRate < 70
            ? 'Consider planning fewer tasks or adjusting your duration estimates to match reality.'
            : 'Great job! Your planning and execution are aligned. Keep up the consistency!'}
        </p>
      </div>
    </div>
  );
};
