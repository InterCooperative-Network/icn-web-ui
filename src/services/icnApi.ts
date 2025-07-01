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

  constructor(baseURL: string = 'http://localhost:8080/api/v1') {
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
            apiError.error_code,
            apiError.message,
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

  // Account Management
  async getAccount(did: Did): Promise<ManaAccount> {
    const response = await this.client.get<ApiResponse<ManaAccount>>(`/accounts/${did}`);
    return response.data.data;
  }

  async getAccountTransactions(
    did: Did,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<ManaTransaction>> {
    const response = await this.client.get<PaginatedResponse<ManaTransaction>>(
      `/accounts/${did}/transactions`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  async transferMana(fromDid: Did, toDid: Did, amount: number): Promise<void> {
    await this.client.post('/accounts/transfer', {
      from: fromDid,
      to: toDid,
      amount,
    });
  }

  // Job Management
  async getJobs(
    page: number = 1,
    limit: number = 20,
    status?: string,
    submitter?: Did
  ): Promise<PaginatedResponse<MeshJob>> {
    const response = await this.client.get<PaginatedResponse<MeshJob>>('/jobs', {
      params: { page, limit, status, submitter },
    });
    return response.data;
  }

  async getJob(jobId: JobId): Promise<MeshJob> {
    const response = await this.client.get<ApiResponse<MeshJob>>(`/jobs/${jobId}`);
    return response.data.data;
  }

  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    const response = await this.client.post<ApiResponse<SubmitJobResponse>>('/jobs', request);
    return response.data.data;
  }

  async cancelJob(jobId: JobId): Promise<void> {
    await this.client.delete(`/jobs/${jobId}`);
  }

  async getJobBids(jobId: JobId): Promise<JobBid[]> {
    const response = await this.client.get<ApiResponse<JobBid[]>>(`/jobs/${jobId}/bids`);
    return response.data.data;
  }

  // Governance
  async getProposals(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<PaginatedResponse<Proposal>> {
    const response = await this.client.get<PaginatedResponse<Proposal>>('/proposals', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async getProposal(proposalId: ProposalId): Promise<Proposal> {
    const response = await this.client.get<ApiResponse<Proposal>>(`/proposals/${proposalId}`);
    return response.data.data;
  }

  async submitProposal(proposal: {
    title: string;
    description: string;
    proposal_type: string;
    changes: any[];
    voting_period_days: number;
  }): Promise<Proposal> {
    const response = await this.client.post<ApiResponse<Proposal>>('/proposals', proposal);
    return response.data.data;
  }

  async vote(
    proposalId: ProposalId,
    voteType: 'For' | 'Against' | 'Abstain',
    reason?: string
  ): Promise<void> {
    await this.client.post(`/proposals/${proposalId}/vote`, {
      vote_type: voteType,
      reason,
    });
  }

  async getProposalVotes(proposalId: ProposalId): Promise<Vote[]> {
    const response = await this.client.get<ApiResponse<Vote[]>>(`/proposals/${proposalId}/votes`);
    return response.data.data;
  }

  // Network
  async getNetworkStats(): Promise<NetworkStats> {
    const response = await this.client.get<ApiResponse<NetworkStats>>('/network/stats');
    return response.data.data;
  }

  async getNetworkPeers(
    page: number = 1,
    limit: number = 50,
    status?: string
  ): Promise<PaginatedResponse<NetworkPeer>> {
    const response = await this.client.get<PaginatedResponse<NetworkPeer>>('/network/peers', {
      params: { page, limit, status },
    });
    return response.data;
  }

  async getPeer(peerId: string): Promise<NetworkPeer> {
    const response = await this.client.get<ApiResponse<NetworkPeer>>(`/network/peers/${peerId}`);
    return response.data.data;
  }

  // Identity
  async resolveDid(did: Did): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/identity/${did}`);
    return response.data.data;
  }

  async registerDid(didDocument: any): Promise<void> {
    await this.client.post('/identity/register', didDocument);
  }

  // Utilities
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response =
      await this.client.get<ApiResponse<{ status: string; timestamp: string }>>('/health');
    return response.data.data;
  }
}

// Create a singleton instance
export const icnApi = new ICNApiClient();

// Export the class for testing or custom instances
export default ICNApiClient;
