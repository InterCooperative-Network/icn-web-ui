import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConnectionStatus, LiveIndicator } from '@/components/ConnectionStatus';
import { useRealtimeJobs } from '@/hooks/useRealtimeData';
import { icnApi } from '@/services/icnApi';
import type { SubmitJobRequest, JobSpecification } from '@/types/icn';
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
  RefreshCw,
  Cpu,
  TrendingUp
} from 'lucide-react';

// Helper functions for job status display
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'running':
      return <Play className="w-4 h-4 text-blue-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
    case 'bidding':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'bidding':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const JobsPage: React.FC = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const queryClient = useQueryClient();

  // Real-time jobs data
  const jobsState = useRealtimeJobs();

  // Submit job mutation
  const submitJobMutation = useMutation({
    mutationFn: (request: SubmitJobRequest) => icnApi.submitJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      jobsState.refetch(); // Also trigger manual refresh
      setShowSubmitModal(false);
    },
  });

  // Filter jobs based on search and status
  const filteredJobs = (jobsState.data || []).filter(job => {
    const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.spec.command.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (jobsState.error && !jobsState.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">Failed to load jobs from the ICN node.</p>
          <p className="text-sm text-red-600 mb-4">{jobsState.error}</p>
          <Button onClick={jobsState.refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mesh Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor distributed computing jobs
          </p>
        </div>
        
        {/* Connection Status & Controls */}
        <div className="flex items-center space-x-4">
          <ConnectionStatus 
            connections={{
              jobs: {
                isConnected: jobsState.isConnected,
                error: jobsState.error,
                lastUpdate: jobsState.lastUpdate,
                isLoading: jobsState.isLoading
              }
            }}
            showDetails
          />
          
          <button
            onClick={jobsState.refetch}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={jobsState.isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${jobsState.isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Button onClick={() => setShowSubmitModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Submit Job</span>
          </Button>
        </div>
      </div>

      {/* Live Updates Indicator */}
      <Card className="p-3 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LiveIndicator isActive={jobsState.isConnected && !jobsState.error} />
            {jobsState.lastUpdate && (
              <span className="text-xs text-gray-500">
                Last updated: {jobsState.lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {filteredJobs.length} of {jobsState.data?.length || 0} jobs
          </div>
        </div>
      </Card>

      {/* Search and Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search jobs by ID or command..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="bidding">Bidding</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Job Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{(jobsState.data || []).length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {(jobsState.data || []).filter((job: any) => ['running', 'assigned', 'bidding'].includes(job.status.toLowerCase())).length}
              </p>
            </div>
            <Play className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {(jobsState.data || []).filter((job: any) => job.status.toLowerCase() === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {(jobsState.data || []).length > 0 
                  ? Math.round(((jobsState.data || []).filter((job: any) => job.status.toLowerCase() === 'completed').length / (jobsState.data || []).length) * 100)
                  : 0
                }%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobsState.isLoading && !jobsState.data ? (
          <Card className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {jobsState.data?.length === 0 ? 'No Jobs Yet' : 'No Matching Jobs'}
              </h3>
              <p className="text-gray-600 mb-4">
                {jobsState.data?.length === 0 
                  ? 'Submit your first mesh computing job to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {jobsState.data?.length === 0 && (
                <Button onClick={() => setShowSubmitModal(true)} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Submit Your First Job</span>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(job.status)}
                    <h3 className="text-lg font-semibold text-gray-900 font-mono">
                      {job.id.substring(0, 12)}...
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Command:</span> {job.spec.command || 'Unknown'}</p>
                    <p><span className="font-medium">Submitter:</span> {job.submitter || 'Unknown'}</p>
                    {job.executor && (
                      <p><span className="font-medium">Executor:</span> {job.executor}</p>
                    )}
                    <p><span className="font-medium">Cost:</span> {job.max_cost} mana</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
            </Card>
          ))
        )}
      </div>

      {/* Submit Job Modal */}
      {showSubmitModal && (
        <JobSubmitModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={(request) => submitJobMutation.mutate(request)}
          isSubmitting={submitJobMutation.isPending}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

// Job Submit Modal Component
interface JobSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: SubmitJobRequest) => void;
  isSubmitting: boolean;
}

const JobSubmitModal: React.FC<JobSubmitModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    command: '',
    args: '',
    environment: '',
    cpu_cores: 1,
    memory_mb: 128,
    disk_mb: 0,
    max_cost: 100,
    timeout_seconds: 300,
  });

  // Job templates for quick start
  const jobTemplates = [
    {
      id: 'echo',
      name: 'Echo Test',
      description: 'Simple echo command for testing',
      spec: {
        command: 'echo',
        args: 'Hello from ICN!',
        environment: '',
        cpu_cores: 1,
        memory_mb: 64,
        disk_mb: 0,
        max_cost: 10,
        timeout_seconds: 30,
      }
    },
    {
      id: 'python',
      name: 'Python Script',
      description: 'Execute Python code',
      spec: {
        command: 'python3',
        args: '-c "print(\'Hello from Python!\')"',
        environment: '{"PYTHONPATH": "/usr/lib/python3/dist-packages"}',
        cpu_cores: 1,
        memory_mb: 256,
        disk_mb: 100,
        max_cost: 50,
        timeout_seconds: 300,
      }
    },
    {
      id: 'compute',
      name: 'Heavy Compute',
      description: 'CPU intensive tasks',
      spec: {
        command: 'stress',
        args: '--cpu 2 --timeout 60s',
        environment: '',
        cpu_cores: 2,
        memory_mb: 512,
        disk_mb: 0,
        max_cost: 200,
        timeout_seconds: 120,
      }
    }
  ];

  const applyTemplate = (templateId: string) => {
    const template = jobTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData(template.spec);
      setActiveTab('basic');
    }
  };

  // Cost estimation
  const estimatedCost = Math.max(
    10, // base cost
    formData.cpu_cores * 20 + 
    Math.ceil(formData.memory_mb / 128) * 15 + 
    Math.ceil(formData.disk_mb / 100) * 5 + 
    Math.ceil(formData.timeout_seconds / 60) * 2
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobSpec: JobSpecification = {
      command: formData.command,
      args: formData.args.split(' ').filter(arg => arg.trim()),
      environment: formData.environment ? JSON.parse(formData.environment) : {},
      resources: {
        cpu_cores: formData.cpu_cores,
        memory_mb: formData.memory_mb,
        disk_mb: formData.disk_mb,
      },
      timeout_seconds: formData.timeout_seconds,
    };

    // For now, create a placeholder manifest CID and encode the job spec
    // In a real implementation, this would upload the job spec to the DAG first
    const manifestCid = `bafybe${Math.random().toString(36).substring(2, 15)}example`;
    
    const request: SubmitJobRequest = {
      manifest_cid: manifestCid,
      spec_json: jobSpec, // Using deprecated JSON format for simplicity
      cost_mana: formData.max_cost,
    };

    onSubmit(request);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Submit Mesh Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'templates' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'basic' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Basic Configuration
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'advanced' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Advanced Options
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <p className="text-gray-600">Choose a template to get started quickly:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jobTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className={`cursor-pointer border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-2 text-xs space-y-1">
                    <div>Command: <code className="bg-gray-100 px-1 rounded">{template.spec.command}</code></div>
                    <div>Cost: ~{template.spec.max_cost} mana</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setActiveTab('basic')}
                disabled={!selectedTemplate}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Customize Selected Template
              </Button>
            </div>
          </div>
        )}

        {/* Basic Configuration Tab */}
        {activeTab === 'basic' && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Command
            </label>
            <Input
              type="text"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="echo 'Hello World'"
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
              placeholder="--verbose --output result.txt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment Variables (JSON)
            </label>
            <Input
              type="text"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              placeholder='{"PATH": "/usr/bin", "DEBUG": "true"}'
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Cores
              </label>
              <Input
                type="number"
                value={formData.cpu_cores}
                onChange={(e) => setFormData({ ...formData, cpu_cores: parseInt(e.target.value) })}
                min="1"
                max="32"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory (MB)
              </label>
              <Input
                type="number"
                value={formData.memory_mb}
                onChange={(e) => setFormData({ ...formData, memory_mb: parseInt(e.target.value) })}
                min="64"
                max="32768"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Cost (mana)
              </label>
              <Input
                type="number"
                value={formData.max_cost}
                onChange={(e) => setFormData({ ...formData, max_cost: parseInt(e.target.value) })}
                min="1"
                max="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <Input
                type="number"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                min="10"
                max="3600"
              />
            </div>
          </div>

            {/* Cost Estimation */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium">Cost Estimation</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Base cost:</span>
                  <span>10 mana</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU ({formData.cpu_cores} cores):</span>
                  <span>{formData.cpu_cores * 20} mana</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory ({formData.memory_mb}MB):</span>
                  <span>{Math.ceil(formData.memory_mb / 128) * 15} mana</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage ({formData.disk_mb}MB):</span>
                  <span>{Math.ceil(formData.disk_mb / 100) * 5} mana</span>
                </div>
                <div className="flex justify-between">
                  <span>Time ({Math.ceil(formData.timeout_seconds / 60)}min):</span>
                  <span>{Math.ceil(formData.timeout_seconds / 60) * 2} mana</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Estimated Total:</span>
                  <span className={estimatedCost > formData.max_cost ? 'text-red-600' : 'text-green-600'}>
                    {estimatedCost} mana
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Job'}
              </Button>
            </div>
          </form>
        )}

        {/* Advanced Options Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800">Advanced Configuration</h3>
              <p className="text-xs text-yellow-700 mt-1">
                These options provide fine-grained control over job execution. Use with caution.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environment Variables (JSON)
                </label>
                <textarea
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  placeholder='{"PATH": "/usr/bin", "DEBUG": "true"}'
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON object with environment variables to set for the job
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value="normal"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Coming Soon)</option>
                    <option value="urgent">Urgent (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retry Policy
                  </label>
                  <select
                    value="none"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  >
                    <option value="none">No Retry</option>
                    <option value="auto">Auto Retry (Coming Soon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Dependencies
                </label>
                <Input
                  type="text"
                  placeholder="job_id_1, job_id_2 (Coming Soon)"
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of job IDs that must complete before this job starts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Handling
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" disabled className="mr-2" />
                    <span className="text-sm text-gray-600">Store stdout in DAG (Coming Soon)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" disabled className="mr-2" />
                    <span className="text-sm text-gray-600">Notify on completion (Coming Soon)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setActiveTab('basic')}
                variant="outline"
                className="mr-3"
              >
                Back to Basic
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Details Modal Component
interface JobDetailsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Job Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job ID</label>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{job.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusIcon(job.status)}
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Command</label>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{job.spec.command}</p>
          </div>
          
          {job.result && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Result</label>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p><strong>Success:</strong> {job.result.success ? 'Yes' : 'No'}</p>
                <p><strong>Execution Time:</strong> {job.result.execution_time_ms}ms</p>
                {job.result.stdout && (
                  <div>
                    <strong>Output:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{job.result.stdout}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {job.error && (
            <div>
              <label className="block text-sm font-medium text-gray-700 text-red-700">Error</label>
              <p className="text-sm bg-red-100 p-2 rounded text-red-800">{job.error}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
