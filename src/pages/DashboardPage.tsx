import { Activity, Zap, Users, Briefcase, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { icnApi } from '../services/icnApi';
import { useState } from 'react';

// Mock DID for development - in real app this would come from auth context
const MOCK_DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

export function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Fetch account data
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account', MOCK_DID],
    queryFn: () => icnApi.getAccount(MOCK_DID),
    staleTime: 30000, // 30 seconds
  });

  // Fetch network stats
  const { data: networkStats, isLoading: networkLoading } = useQuery({
    queryKey: ['network-stats'],
    queryFn: () => icnApi.getNetworkStats(),
    staleTime: 60000, // 1 minute
  });

  // Fetch recent jobs
  const { data: recentJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['recent-jobs'],
    queryFn: () => icnApi.getJobs(1, 5),
    staleTime: 30000,
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', MOCK_DID],
    queryFn: () => icnApi.getAccountTransactions(MOCK_DID, 1, 10),
    staleTime: 30000,
  });

  const isLoading = accountLoading || networkLoading || jobsLoading || transactionsLoading;

  const formatMana = (mana: number) => {
    return new Intl.NumberFormat().format(mana);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600';
      case 'Running':
        return 'text-blue-600';
      case 'Failed':
        return 'text-red-600';
      case 'Pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Running':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Loading your ICN federation overview...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="icn-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Overview of your ICN federation and network activity
          </p>
        </div>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-icn-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-mana-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Mana
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {account ? formatMana(account.mana_balance) : 'Loading...'}
                </dd>
              </dl>
            </div>
          </div>
          {account && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Regenerating at {account.regeneration_rate.toFixed(2)}/hour
              </div>
            </div>
          )}
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-8 w-8 text-icn-primary" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Jobs
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {recentJobs?.data.filter(job => job.status === 'Running' || job.status === 'Pending').length || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Network Peers
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {networkStats?.active_peers || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reputation Score
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {account?.reputation_score.toFixed(1) || '0.0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Jobs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="icn-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Recent Jobs
            </h3>
            <div className="space-y-3">
              {recentJobs?.data.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.spec.command}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMana(job.actual_cost || job.max_cost)} mana
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(job.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              {(!recentJobs?.data || recentJobs.data.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent jobs
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="icn-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {transactions?.data.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      tx.amount > 0 ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.transaction_type}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.description || 'Transaction'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatMana(tx.amount)} mana
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(tx.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {(!transactions?.data || transactions.data.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      {networkStats && (
        <div className="icn-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              Network Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Peers</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkStats.total_peers}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Jobs Completed</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkStats.total_jobs_completed}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Completion</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(networkStats.average_job_completion_time_ms / 1000)}s
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Mana</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatMana(networkStats.total_mana_in_circulation)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
