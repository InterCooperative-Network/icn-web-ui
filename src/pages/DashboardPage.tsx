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
  XCircle,
  AlertCircle
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
    const completed = jobs.filter(job => job.status === 'Completed').length;
    const running = jobs.filter(job => job.status === 'Running').length;
    const failed = jobs.filter(job => job.status === 'Failed').length;
    const pending = jobs.filter(job => job.status === 'Pending' || job.status === 'Bidding').length;

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
        {/* Total Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobsLoading ? '...' : jobStats.total}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
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
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Active Peers */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Peers</p>
              <p className="text-2xl font-bold text-gray-900">
                {peersLoading ? '...' : peers.length}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Block Height */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Block Height</p>
              <p className="text-2xl font-bold text-gray-900">
                {nodeStatusLoading ? '...' : nodeStatus?.current_block_height || 0}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Job Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-gray-900">{jobStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Running</span>
              </div>
              <span className="font-semibold text-gray-900">{jobStats.running}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-gray-900">{jobStats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700">Failed</span>
              </div>
              <span className="font-semibold text-gray-900">{jobStats.failed}</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Job {job.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent jobs</p>
            )}
          </div>
        </Card>
      </div>

      {/* Network Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Node Version</p>
            <p className="font-medium text-gray-900">{nodeInfo?.version || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Peer Count</p>
            <p className="font-medium text-gray-900">
              {nodeStatusLoading ? '...' : nodeStatus?.peer_count || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Connection Status</p>
            <p className="font-medium text-gray-900">
              {nodeStatus?.is_online ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
