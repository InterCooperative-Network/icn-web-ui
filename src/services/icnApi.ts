import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  MeshJob,
  SubmitJobRequest,
  SubmitJobResponse,
  ApiError,
  Did,
  JobId,
  ProposalId,
  NodeInfo,
  NodeStatus,
  DagBlock,
  Cid,
  JobStatus,
  Proposal,
} from '@/types/icn';

export class ICNApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ICNApiError';
  }
}

export class ICNApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data) {
          const apiError = error.response.data;
          throw new ICNApiError(
            error.response.status,
            apiError.error_code || 'UNKNOWN_ERROR',
            apiError.message || error.message,
            apiError.details
          );
        }
        throw new ICNApiError(500, 'NETWORK_ERROR', error.message);
      }
    );
  }

  // Authentication
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setApiKey(apiKey: string) {
    this.client.defaults.headers.common['x-api-key'] = apiKey;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  clearApiKey() {
    delete this.client.defaults.headers.common['x-api-key'];
  }

  // Node Information
  async getNodeInfo(): Promise<NodeInfo> {
    const response = await this.client.get<NodeInfo>('/info');
    return response.data;
  }

  async getNodeStatus(): Promise<NodeStatus> {
    const response = await this.client.get<NodeStatus>('/status');
    return response.data;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // Mana/Account Management - Updated to use existing endpoints
  async getCurrentAccountInfo(): Promise<{ did: string; mana: number }> {
    // Get account info from node info endpoint since /account/{did}/mana doesn't exist
    const nodeInfo = await this.getNodeInfo();
    // Parse mana from status_message which contains "Node DID: {did}, Mana: {balance}"
    const match = nodeInfo.status_message.match(/Node DID: (.+?), Mana: (\d+)/);
    if (match) {
      return {
        did: match[1],
        mana: parseInt(match[2], 10)
      };
    }
    return { did: 'unknown', mana: 0 };
  }

  // Reputation - This endpoint exists in icn-core
  async getReputation(did: Did): Promise<{ score: number; frozen?: boolean }> {
    const response = await this.client.get<{ score: number; frozen?: boolean }>(`/reputation/${did}`);
    return response.data;
  }

  // Job Management (Mesh) - Fixed to match actual API response format
  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    const response = await this.client.post<SubmitJobResponse>('/mesh/submit', request);
    return response.data;
  }

  async getJobs(): Promise<MeshJob[]> {
    // API returns { "jobs": [...] } not direct array
    const response = await this.client.get<{ jobs: any[] }>('/mesh/jobs');
    
    // Transform the response to match our MeshJob interface
    return response.data.jobs.map(job => ({
      id: job.job_id,
      submitter: 'unknown', // Not provided in current API
      executor: job.status?.executor || undefined,
      status: this.normalizeJobStatus(job.status),
      spec: {
        command: 'unknown', // Not provided in current API
        args: [],
        environment: {},
        resources: {
          cpu_cores: 1,
          memory_mb: 128,
          disk_mb: 0
        }
      },
      max_cost: 0, // Not provided in current API
      created_at: new Date().toISOString(), // Not provided in current API
      updated_at: new Date().toISOString(), // Not provided in current API
      result: job.status?.status === 'completed' ? {
        success: true,
        execution_time_ms: job.status.cpu_ms || 0,
        resources_used: {
          cpu_time_ms: job.status.cpu_ms || 0,
          memory_peak_mb: 0,
          disk_used_mb: 0,
          network_bytes: 0
        }
      } : undefined,
      error: job.status?.reason || undefined
    }));
  }

  async getJob(jobId: JobId): Promise<MeshJob> {
    const response = await this.client.get<any>(`/mesh/jobs/${jobId}`);
    const job = response.data;
    
    // Transform the response to match our MeshJob interface
    return {
      id: job.job_id,
      submitter: 'unknown',
      executor: job.status?.executor || undefined,
      status: this.normalizeJobStatus(job.status),
      spec: {
        command: 'unknown',
        args: [],
        environment: {},
        resources: {
          cpu_cores: 1,
          memory_mb: 128,
          disk_mb: 0
        }
      },
      max_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      result: job.status?.status === 'completed' ? {
        success: true,
        execution_time_ms: job.status.cpu_ms || 0,
        resources_used: {
          cpu_time_ms: job.status.cpu_ms || 0,
          memory_peak_mb: 0,
          disk_used_mb: 0,
          network_bytes: 0
        }
      } : undefined,
      error: job.status?.reason || undefined
    };
  }

  private normalizeJobStatus(status: any): JobStatus {
    if (typeof status === 'string') {
      const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      switch (normalized) {
        case 'Pending':
        case 'Bidding':
        case 'Assigned':
        case 'Running':
        case 'Completed':
        case 'Failed':
        case 'Cancelled':
          return normalized as JobStatus;
        default:
          return 'Unknown';
      }
    }
    if (typeof status === 'object' && status?.status) {
      return this.normalizeJobStatus(status.status);
    }
    return 'Unknown';
  }

  // Governance - These endpoints exist and work
  async submitProposal(proposal: {
    proposer_did: string;
    proposal: any;
    description: string;
    duration_secs: number;
  }): Promise<{ proposal_id: string }> {
    const response = await this.client.post<string>('/governance/submit', proposal);
    // API returns raw string, wrap it
    return { proposal_id: response.data };
  }

  async getProposals(): Promise<Proposal[]> {
    const response = await this.client.get<Proposal[]>('/governance/proposals');
    return response.data;
  }

  async getProposal(proposalId: ProposalId): Promise<Proposal> {
    const response = await this.client.get<Proposal>(`/governance/proposal/${proposalId}`);
    return response.data;
  }

  async vote(voteRequest: {
    voter_did: string;
    proposal_id: string;
    vote_option: string;
  }): Promise<void> {
    await this.client.post(`/governance/vote`, voteRequest);
  }

  // Network
  async getNetworkPeers(): Promise<string[]> {
    const response = await this.client.get<string[]>('/network/peers');
    return response.data;
  }

  async getLocalPeerId(): Promise<{ peer_id: string }> {
    const response = await this.client.get<{ peer_id: string }>('/network/local-peer-id');
    return response.data;
  }

  // DAG Operations
  async putDagBlock(block: DagBlock): Promise<Cid> {
    const response = await this.client.post<string>('/dag/put', block);
    return response.data;
  }

  async getDagBlock(cid: Cid): Promise<DagBlock> {
    const response = await this.client.post<DagBlock>('/dag/get', { cid });
    return response.data;
  }

  async getDagRoot(): Promise<{ root: Cid | null }> {
    const response = await this.client.get<{ root: Cid | null }>('/dag/root');
    return response.data;
  }

  async getDagStatus(): Promise<{ current_root: Cid | null; in_sync: boolean }> {
    const response = await this.client.get<{ current_root: Cid | null; in_sync: boolean }>('/dag/status');
    return response.data;
  }

  // Federation
  async getFederationPeers(): Promise<string[]> {
    const response = await this.client.get<string[]>('/federation/peers');
    return response.data;
  }

  async getFederationStatus(): Promise<{ peer_count: number; peers: string[] }> {
    const response = await this.client.get<{ peer_count: number; peers: string[] }>('/federation/status');
    return response.data;
  }

  // Metrics
  async getMetrics(): Promise<string> {
    const response = await this.client.get<string>('/metrics');
    return response.data;
  }

  // Utilities
  async submitTransaction(txJson: string): Promise<{ tx_id: string }> {
    const response = await this.client.post<{ tx_id: string }>('/transaction/submit', { tx_json: txJson });
    return response.data;
  }

  async queryData(cid: Cid): Promise<DagBlock | null> {
    const response = await this.client.post<DagBlock | null>('/data/query', { cid });
    return response.data;
  }
}

// Create a singleton instance
export const icnApi = new ICNApiClient();

// Export the class for testing or custom instances
export default ICNApiClient;
