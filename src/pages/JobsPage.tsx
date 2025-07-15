import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { icnApi } from '@/services/icnApi';
import type { MeshJob, SubmitJobRequest, JobSpecification } from '@/types/icn';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';

const JobsPage: React.FC = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<MeshJob | null>(null);
  const queryClient = useQueryClient();

  // Fetch jobs
  const { data: jobs = [], isLoading, error } = useQuery<MeshJob[]>({
    queryKey: ['jobs'],
    queryFn: () => icnApi.getJobs(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Submit job mutation
  const submitJobMutation = useMutation({
    mutationFn: (request: SubmitJobRequest) => icnApi.submitJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setShowSubmitModal(false);
    },
  });

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.spec.command.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Pending':
      case 'Bidding':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Running':
        return 'bg-blue-100 text-blue-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      case 'Bidding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600">Failed to load jobs from the ICN node.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage and monitor mesh computing jobs</p>
        </div>
        <Button onClick={() => setShowSubmitModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Submit Job</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Bidding">Bidding</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">No jobs match your current filters.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {job.spec.command}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {job.id.slice(0, 8)}... | Submitted: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Submit Job Modal */}
      {showSubmitModal && (
        <SubmitJobModal
          onSubmit={(request) => submitJobMutation.mutate(request)}
          onClose={() => setShowSubmitModal(false)}
          isLoading={submitJobMutation.isPending}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

// Submit Job Modal Component
interface SubmitJobModalProps {
  onSubmit: (request: SubmitJobRequest) => void;
  onClose: () => void;
  isLoading: boolean;
}

const SubmitJobModal: React.FC<SubmitJobModalProps> = ({ onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    command: '',
    args: '',
    environment: '',
    cpu_cores: 1,
    memory_mb: 128,
    disk_mb: 0,
    max_cost: 100,
    timeout_seconds: 300,
    priority: 'Normal' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobSpec: JobSpecification = {
      command: formData.command,
      args: formData.args ? formData.args.split(' ').filter(Boolean) : [],
      environment: formData.environment ? JSON.parse(formData.environment) : {},
      resources: {
        cpu_cores: formData.cpu_cores,
        memory_mb: formData.memory_mb,
        disk_mb: formData.disk_mb,
      },
      timeout_seconds: formData.timeout_seconds,
    };

    const request: SubmitJobRequest = {
      job_spec: jobSpec,
      max_cost: formData.max_cost,
      timeout_seconds: formData.timeout_seconds,
      priority: formData.priority,
      metadata: {},
    };

    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Submit New Job</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Command
            </label>
            <Input
              type="text"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="e.g., echo 'Hello World'"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arguments (space-separated)
            </label>
            <Input
              type="text"
              value={formData.args}
              onChange={(e) => setFormData({ ...formData, args: e.target.value })}
              placeholder="e.g., arg1 arg2 arg3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Cores
              </label>
              <Input
                type="number"
                min="1"
                max="16"
                value={formData.cpu_cores}
                onChange={(e) => setFormData({ ...formData, cpu_cores: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory (MB)
              </label>
              <Input
                type="number"
                min="64"
                max="8192"
                value={formData.memory_mb}
                onChange={(e) => setFormData({ ...formData, memory_mb: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disk (MB)
              </label>
              <Input
                type="number"
                min="0"
                max="10240"
                value={formData.disk_mb}
                onChange={(e) => setFormData({ ...formData, disk_mb: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Cost (Mana)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_cost}
                onChange={(e) => setFormData({ ...formData, max_cost: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <Input
                type="number"
                min="60"
                max="3600"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Job Details Modal Component
interface JobDetailsModalProps {
  job: MeshJob;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            ×
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Job ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{job.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Submitter:</span>
                  <p className="text-sm text-gray-900">{job.submitter}</p>
                </div>
                {job.executor && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Executor:</span>
                    <p className="text-sm text-gray-900">{job.executor}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Timing</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Created:</span>
                  <p className="text-sm text-gray-900">{new Date(job.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Updated:</span>
                  <p className="text-sm text-gray-900">{new Date(job.updated_at).toLocaleString()}</p>
                </div>
                {job.completed_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Completed:</span>
                    <p className="text-sm text-gray-900">{new Date(job.completed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Specification</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Command:</span>
                  <p className="text-sm text-gray-900 font-mono">{job.spec.command}</p>
                </div>
                {job.spec.args.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Arguments:</span>
                    <p className="text-sm text-gray-900 font-mono">{job.spec.args.join(' ')}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Resources:</span>
                  <p className="text-sm text-gray-900">
                    {job.spec.resources.cpu_cores} CPU cores, {job.spec.resources.memory_mb}MB RAM, {job.spec.resources.disk_mb}MB disk
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cost</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Max Cost:</span>
                  <p className="text-sm text-gray-900">{job.max_cost} mana</p>
                </div>
                {job.actual_cost && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Actual Cost:</span>
                    <p className="text-sm text-gray-900">{job.actual_cost} mana</p>
                  </div>
                )}
              </div>
            </div>

            {job.result && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Result</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Success:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${job.result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {job.result.success ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {job.result.exit_code !== undefined && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Exit Code:</span>
                      <p className="text-sm text-gray-900">{job.result.exit_code}</p>
                    </div>
                  )}
                  {job.result.execution_time_ms && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Execution Time:</span>
                      <p className="text-sm text-gray-900">{job.result.execution_time_ms}ms</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {job.error && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{job.error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Running':
      return 'bg-blue-100 text-blue-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    case 'Pending':
    case 'Bidding':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default JobsPage;
