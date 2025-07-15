import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Stop, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Briefcase
} from 'lucide-react';
import { icnApi } from '../services/icnApi';
import type { JobStatus, JobPriority, SubmitJobRequest } from '../types/icn';

// Mock DID for development
const MOCK_DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

export function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch jobs with filters
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchTerm, statusFilter, priorityFilter],
    queryFn: () => icnApi.getJobs(1, 50, statusFilter === 'all' ? undefined : statusFilter),
    staleTime: 30000,
  });

  // Submit job mutation
  const submitJobMutation = useMutation({
    mutationFn: (request: SubmitJobRequest) => icnApi.submitJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setShowSubmitForm(false);
    },
  });

  // Cancel job mutation
  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => icnApi.cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

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

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-100';
      case 'Running':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-800 dark:text-blue-100';
      case 'Failed':
        return 'text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Bidding':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-800 dark:text-purple-100';
      case 'Assigned':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-800 dark:text-indigo-100';
      case 'Cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Running':
        return <Activity className="h-4 w-4" />;
      case 'Failed':
        return <XCircle className="h-4 w-4" />;
      case 'Pending':
      case 'Bidding':
      case 'Assigned':
        return <Clock className="h-4 w-4" />;
      case 'Cancelled':
        return <Stop className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Normal':
        return 'text-blue-600';
      case 'Low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredJobs = jobs?.data.filter(job => {
    const matchesSearch = job.spec.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mesh Jobs</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor computational jobs across the ICN mesh network
          </p>
        </div>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-icn-primary hover:bg-icn-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-icn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Job
        </button>
      </div>

      {/* Filters */}
      <div className="icn-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by command or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Bidding">Bidding</option>
              <option value="Assigned">Assigned</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as JobPriority | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="icn-card">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Jobs ({filteredJobs.length})
            </h3>
            {isLoading && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1">{job.status}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.spec.command}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {job.id.substring(0, 8)}... • {formatTimeAgo(job.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Resource Requirements */}
                    <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        {job.spec.resources.cpu_cores}
                      </div>
                      <div className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {job.spec.resources.memory_mb}MB
                      </div>
                      <div className="flex items-center">
                        <Wifi className="h-3 w-3 mr-1" />
                        {job.spec.resources.disk_mb}MB
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center text-sm">
                      <Zap className="h-4 w-4 text-mana-600 mr-1" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatMana(job.actual_cost || job.max_cost)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedJob(job.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(job.status === 'Pending' || job.status === 'Bidding' || job.status === 'Assigned') && (
                        <button
                          onClick={() => cancelJobMutation.mutate(job.id)}
                          disabled={cancelJobMutation.isPending}
                          className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50"
                          title="Cancel Job"
                        >
                          <Stop className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Result (if completed) */}
                {job.result && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Exit Code: {job.result.exit_code} • 
                      Execution Time: {job.result.execution_time_ms}ms
                    </div>
                    {job.result.stdout && (
                      <div className="mt-1 text-xs font-mono text-gray-800 dark:text-gray-200">
                        <div className="font-medium">Output:</div>
                        <div className="whitespace-pre-wrap">{job.result.stdout}</div>
                      </div>
                    )}
                    {job.result.stderr && (
                      <div className="mt-1 text-xs font-mono text-red-600">
                        <div className="font-medium">Error:</div>
                        <div className="whitespace-pre-wrap">{job.result.stderr}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message (if failed) */}
                {job.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="text-xs text-red-600 dark:text-red-400">
                      <div className="font-medium">Error:</div>
                      {job.error}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredJobs.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Briefcase className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by submitting your first mesh job.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Submission Modal */}
      {showSubmitForm && (
        <JobSubmissionModal
          onSubmit={(request) => submitJobMutation.mutate(request)}
          onCancel={() => setShowSubmitForm(false)}
          isLoading={submitJobMutation.isPending}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          jobId={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// Job Submission Modal Component
function JobSubmissionModal({ 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  onSubmit: (request: SubmitJobRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    command: '',
    args: '',
    cpuCores: 1,
    memoryMb: 512,
    diskMb: 1024,
    maxCost: 100,
    priority: 'Normal' as JobPriority,
    timeout: 300,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: SubmitJobRequest = {
      job_spec: {
        command: formData.command,
        args: formData.args.split(' ').filter(Boolean),
        environment: {},
        resources: {
          cpu_cores: formData.cpuCores,
          memory_mb: formData.memoryMb,
          disk_mb: formData.diskMb,
        },
        timeout_seconds: formData.timeout,
      },
      max_cost: formData.maxCost,
      priority: formData.priority,
      metadata: {},
    };
    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Submit New Job
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Command
            </label>
            <input
              type="text"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="e.g., python script.py"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arguments
            </label>
            <input
              type="text"
              value={formData.args}
              onChange={(e) => setFormData({ ...formData, args: e.target.value })}
              placeholder="e.g., --input data.csv --output results.json"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CPU Cores
              </label>
              <input
                type="number"
                min="1"
                max="32"
                value={formData.cpuCores}
                onChange={(e) => setFormData({ ...formData, cpuCores: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Memory (MB)
              </label>
              <input
                type="number"
                min="128"
                max="32768"
                value={formData.memoryMb}
                onChange={(e) => setFormData({ ...formData, memoryMb: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Disk (MB)
              </label>
              <input
                type="number"
                min="256"
                max="65536"
                value={formData.diskMb}
                onChange={(e) => setFormData({ ...formData, diskMb: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Cost (Mana)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCost}
                onChange={(e) => setFormData({ ...formData, maxCost: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as JobPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="60"
                max="3600"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-icn-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-icn-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-icn-primary border border-transparent rounded-md hover:bg-icn-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-icn-primary disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Job Details Modal Component
function JobDetailsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => icnApi.getJob(jobId),
  });

  const { data: bids } = useQuery({
    queryKey: ['job-bids', jobId],
    queryFn: () => icnApi.getJobBids(jobId),
    enabled: !!job && (job.status === 'Bidding' || job.status === 'Assigned'),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4">
          <div className="text-center">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Basic Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job ID</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{job.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{job.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitter</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{job.submitter}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Executor</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{job.executor || 'Not assigned'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Timing</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{new Date(job.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{new Date(job.updated_at).toLocaleString()}</dd>
                </div>
                {job.completed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{new Date(job.completed_at).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Job Specification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Job Specification</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Command</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{job.spec.command}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Arguments</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{job.spec.args.join(' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU Cores</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{job.spec.resources.cpu_cores}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{job.spec.resources.memory_mb} MB</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Disk</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{job.spec.resources.disk_mb} MB</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeout</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{job.spec.timeout_seconds || 'Default'} seconds</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cost Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Maximum Cost</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{formatMana(job.max_cost)} mana</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Cost</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{job.actual_cost ? formatMana(job.actual_cost) : 'Not charged yet'} mana</dd>
              </div>
            </div>
          </div>

          {/* Job Result */}
          {job.result && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Execution Result</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Success</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{job.result.success ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Exit Code</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{job.result.exit_code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Execution Time</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{job.result.execution_time_ms} ms</dd>
                  </div>
                </div>

                {job.result.stdout && (
                  <div className="mb-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Standard Output</dt>
                    <dd className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                      <pre>{job.result.stdout}</pre>
                    </dd>
                  </div>
                )}

                {job.result.stderr && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Standard Error</dt>
                    <dd className="text-sm font-mono text-red-600 bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                      <pre>{job.result.stderr}</pre>
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Information */}
          {job.error && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Information</h3>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="text-sm text-red-600 dark:text-red-400">
                  {job.error}
                </div>
              </div>
            </div>
          )}

          {/* Bids (if applicable) */}
          {bids && bids.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bids ({bids.length})</h3>
              <div className="space-y-2">
                {bids.map((bid) => (
                  <div key={bid.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {bid.executor}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Reputation: {bid.reputation_score.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatMana(bid.cost_bid)} mana
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Est. {bid.estimated_duration_seconds}s
                        </div>
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
  );
}
