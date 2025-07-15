import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ManaAccount,
  ManaTransaction,
  MeshJob,
  JobBid,
  Proposal,
  Vote,
  NetworkPeer,
  NetworkStats,
  SubmitJobRequest,
  SubmitJobResponse,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  Did,
  JobId,
  ProposalId,
  NodeInfo,
  NodeStatus,
  DagBlock,
  Cid,
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

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
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

  // Account Management (Mana)
  async getAccountMana(did: Did): Promise<ManaAccount> {
    const response = await this.client.get<ManaAccount>(`/account/${did}/mana`);
    return response.data;
  }

  async getReputation(did: Did): Promise<{ reputation: number }> {
    const response = await this.client.get<{ reputation: number }>(`/reputation/${did}`);
    return response.data;
  }

  // Job Management (Mesh)
  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    const response = await this.client.post<SubmitJobResponse>('/mesh/submit', request);
    return response.data;
  }

  async getJobs(): Promise<MeshJob[]> {
    const response = await this.client.get<MeshJob[]>('/mesh/jobs');
    return response.data;
  }

  async getJob(jobId: JobId): Promise<MeshJob> {
    const response = await this.client.get<MeshJob>(`/mesh/jobs/${jobId}`);
    return response.data;
  }

  // Governance
  async submitProposal(proposal: {
    proposer_did: string;
    proposal: any;
    description: string;
    duration_secs: number;
  }): Promise<{ proposal_id: string }> {
    const response = await this.client.post<{ proposal_id: string }>('/governance/submit', proposal);
    return response.data;
  }

  async getProposals(): Promise<Proposal[]> {
    const response = await this.client.get<Proposal[]>('/governance/proposals');
    return response.data;
  }

  async getProposal(proposalId: ProposalId): Promise<Proposal> {
    const response = await this.client.get<Proposal>(`/governance/proposal/${proposalId}`);
    return response.data;
  }

  async vote(proposalId: ProposalId, voteRequest: {
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

  // Identity
  async getKeys(): Promise<{ did: string; public_key_bs58: string }> {
    const response = await this.client.get<{ did: string; public_key_bs58: string }>('/keys');
    return response.data;
  }

  // Federation
  async getFederationPeers(): Promise<string[]> {
    const response = await this.client.get<string[]>('/federation/peers');
    return response.data;
  }

  async getFederationStatus(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/federation/status');
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
