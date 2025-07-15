import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { icnApi } from '@/services/icnApi';
import type { NodeInfo, NodeStatus, MeshJob } from '@/types/icn';
import { 
  Activity, 
  Users, 
  Cpu, 
  Database, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Fetch node information
  const { data: nodeInfo, isLoading: nodeInfoLoading } = useQuery<NodeInfo>({
    queryKey: ['nodeInfo'],
    queryFn: () => icnApi.getNodeInfo(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch node status
  const { data: nodeStatus, isLoading: nodeStatusLoading } = useQuery<NodeStatus>({
    queryKey: ['nodeStatus'],
    queryFn: () => icnApi.getNodeStatus(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch current account info (mana balance)
  const { data: accountInfo, isLoading: accountInfoLoading } = useQuery({
    queryKey: ['accountInfo'],
    queryFn: () => icnApi.getCurrentAccountInfo(),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<MeshJob[]>({
    queryKey: ['jobs'],
    queryFn: () => icnApi.getJobs(),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch network peers
  const { data: peers = [], isLoading: peersLoading } = useQuery<string[]>({
    queryKey: ['peers'],
    queryFn: () => icnApi.getNetworkPeers(),
    refetchInterval: 20000, // Refresh every 20 seconds
  });

  // Calculate job statistics
  const jobStats = React.useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(job => 
      job.status.toLowerCase() === 'completed'
    ).length;
    const running = jobs.filter(job => 
      job.status.toLowerCase() === 'running'
    ).length;
    const failed = jobs.filter(job => 
      job.status.toLowerCase() === 'failed'
    ).length;
    const pending = jobs.filter(job => 
      job.status.toLowerCase() === 'pending' || job.status.toLowerCase() === 'bidding'
    ).length;

    return { total, completed, running, failed, pending };
  }, [jobs]);

  // Calculate success rate
  const successRate = jobStats.total > 0 ? (jobStats.completed / jobStats.total) * 100 : 0;

  if (nodeInfoLoading || nodeStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {nodeInfo?.name || 'ICN Node'} - {nodeInfo?.version || 'Unknown Version'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${nodeStatus?.is_online ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {nodeStatus?.is_online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Status Message */}
      {nodeInfo?.status_message && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">{nodeInfo.status_message}</span>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mana Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mana Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {accountInfoLoading ? '...' : accountInfo?.mana || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Network Peers */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Peers</p>
              <p className="text-2xl font-bold text-gray-900">
                {peersLoading ? '...' : peers.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobsLoading ? '...' : jobStats.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Cpu className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobsLoading ? '...' : `${successRate.toFixed(1)}%`}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Job Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">{jobStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Running</span>
              </div>
              <span className="text-sm font-medium">{jobStats.running}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium">{jobStats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Failed</span>
              </div>
              <span className="text-sm font-medium">{jobStats.failed}</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {jobsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No jobs yet</p>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {job.status.toLowerCase() === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {job.status.toLowerCase() === 'running' && <Activity className="w-4 h-4 text-blue-500" />}
                    {(job.status.toLowerCase() === 'pending' || job.status.toLowerCase() === 'bidding') && <Clock className="w-4 h-4 text-yellow-500" />}
                    {job.status.toLowerCase() === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className="text-sm text-gray-900 font-mono">
                      {job.id.substring(0, 8)}...
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status.toLowerCase() === 'running' ? 'bg-blue-100 text-blue-800' :
                    job.status.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
