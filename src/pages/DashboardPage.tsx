import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  useRealtimeNodeStatus, 
  useRealtimeJobs, 
  useRealtimeAccountInfo, 
  useRealtimePeers 
} from '@/hooks/useRealtimeData';
import { testApiConnection } from '@/services/icnApi';
import { 
  Activity, 
  Users, 
  Cpu, 
  Database, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Real-time data hooks
  const nodeStatus = useRealtimeNodeStatus();
  const accountInfo = useRealtimeAccountInfo();
  const jobs = useRealtimeJobs();
  const peers = useRealtimePeers();

  // Debug logging
  React.useEffect(() => {
    console.log('🔬 Dashboard hook states:', {
      nodeStatus: { isLoading: nodeStatus.isLoading, data: !!nodeStatus.data, error: nodeStatus.error },
      accountInfo: { isLoading: accountInfo.isLoading, data: !!accountInfo.data, error: accountInfo.error },
      jobs: { isLoading: jobs.isLoading, data: !!jobs.data, error: jobs.error },
      peers: { isLoading: peers.isLoading, data: !!peers.data, error: peers.error }
    });
  }, [nodeStatus.isLoading, accountInfo.isLoading, jobs.isLoading, peers.isLoading]);

  // Test API client directly on mount
  React.useEffect(() => {
    console.log('🔬 Testing API client directly...');
    testApiConnection().catch(error => {
      console.log('🔬 Direct API test failed:', error);
    });
  }, []);

  // Calculate job statistics
  const jobStats = React.useMemo(() => {
    if (!jobs.data) return { total: 0, completed: 0, running: 0, failed: 0, pending: 0 };
    
    const total = jobs.data.length;
    const completed = jobs.data.filter(job => 
      job.status.toLowerCase() === 'completed'
    ).length;
    const running = jobs.data.filter(job => 
      job.status.toLowerCase() === 'running'
    ).length;
    const failed = jobs.data.filter(job => 
      job.status.toLowerCase() === 'failed'
    ).length;
    const pending = jobs.data.filter(job => 
      job.status.toLowerCase() === 'pending' || job.status.toLowerCase() === 'bidding'
    ).length;

    return { total, completed, running, failed, pending };
  }, [jobs.data]);

  // Calculate success rate
  const successRate = jobStats.total > 0 ? (jobStats.completed / jobStats.total) * 100 : 0;

  // Connection status indicator
  const isConnected = nodeStatus.isConnected && accountInfo.isConnected && jobs.isConnected && peers.isConnected;
  const hasErrors = nodeStatus.error || accountInfo.error || jobs.error || peers.error;

  // Show loading only for the first few seconds, then show dashboard with whatever data we have
  const [hasWaited, setHasWaited] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setHasWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!hasWaited && nodeStatus.isLoading && !nodeStatus.data && !nodeStatus.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
            ICN Node - {nodeStatus.data?.version || 'Unknown Version'}
          </p>
        </div>
        
        {/* Connection Status & Manual Refresh */}
        <div className="flex items-center space-x-4">
          {/* Connection Indicator */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              nodeStatus.refetch();
              accountInfo.refetch();
              jobs.refetch();
              peers.refetch();
            }}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-800 dark:text-gray-200 font-medium"
            disabled={nodeStatus.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${nodeStatus.isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Debug API Button */}
          <button
            onClick={async () => {
              console.log('🔬 Debug: Testing API connection...');
              try {
                await testApiConnection();
                console.log('🔬 Debug: API test completed - check console for details');
              } catch (error) {
                console.log('🔬 Debug: API test failed - check console for details');
              }
            }}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-md transition-colors text-red-800 dark:text-red-200 font-medium"
          >
            <span>🔬 Debug API</span>
          </button>

          {/* Node Status Dot */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${nodeStatus.data?.is_online ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {nodeStatus.data?.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {hasErrors && (
        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <span className="text-red-800 dark:text-red-300 font-bold">Connection Issues Detected</span>
              <div className="text-sm text-red-700 dark:text-red-400 mt-1 font-medium">
                {nodeStatus.error && <div>• Node Status: {nodeStatus.error}</div>}
                {accountInfo.error && <div>• Account Info: {accountInfo.error}</div>}
                {jobs.error && <div>• Jobs: {jobs.error}</div>}
                {peers.error && <div>• Peers: {peers.error}</div>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Last Update Info */}
      {(nodeStatus.lastUpdate || jobs.lastUpdate) && (
        <Card className="p-3 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 font-medium">
            <span>
              Last update: {new Date(Math.max(
                nodeStatus.lastUpdate?.getTime() || 0,
                jobs.lastUpdate?.getTime() || 0,
                accountInfo.lastUpdate?.getTime() || 0,
                peers.lastUpdate?.getTime() || 0
              )).toLocaleTimeString()}
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </span>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mana Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Mana Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {accountInfo.isLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-16 rounded"></div>
                ) : (
                  accountInfo.data?.mana || 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Network Peers */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Network Peers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {peers.isLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-8 rounded"></div>
                ) : (
                  peers.data?.length || 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Total Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobs.isLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-8 rounded"></div>
                ) : (
                  jobStats.total
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Cpu className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobs.isLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-12 rounded"></div>
                ) : (
                  `${successRate.toFixed(1)}%`
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Job Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{jobStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Running</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{jobStats.running}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{jobStats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Failed</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{jobStats.failed}</span>
            </div>
          </div>
        </Card>

        {/* Recent Jobs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {jobs.isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-300 mx-auto"></div>
              </div>
            ) : jobs.data && jobs.data.length > 0 ? (
              jobs.data.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      Job {job.id?.slice(0, 8) || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {job.command || 'No command specified'}
                    </p>
                    Made labels use font-bold instead of just font-medium
                    Improved secondary text from tex
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                      ${job.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        job.status.toLowerCase() === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        job.status.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Cpu className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-bold text-gray-800 dark:text-gray-300">No jobs yet</h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                  Submit your first mesh job to get started.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
