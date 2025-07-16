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

// Additional types for enhanced API coverage
export interface ICNClientConfig {
  baseUrl: string;
  apiKey?: string;
  bearerToken?: string;
  timeout?: number;
}

export interface ErrorResponse {
  error: string;
  details?: any;
  correlation_id?: string;
}

// Enhanced governance types
export interface SubmitProposalRequest {
  proposer_did: string;
  proposal: any;
  description: string;
  duration_secs: number;
  quorum?: number;
  threshold?: number;
}

export interface CastVoteRequest {
  voter_did: string;
  proposal_id: string;
  vote_option: "Yes" | "No" | "Abstain";
}

// Identity and credential types
export interface VerifiableCredential {
  cid: string;
  issuer: string;
  holder: string;
  attributes: Record<string, string>;
  issued_at: string;
  expires_at?: string;
}

export interface CredentialResponse {
  cid: string;
  credential: VerifiableCredential;
}

// Federation types
export interface FederationStatus {
  peer_count: number;
  peers: string[];
}

export interface FederationPeerRequest {
  peer_id: string;
}

// Account types
export interface ManaBalance {
  balance: number;
  capacity: number;
  regeneration_rate: number;
  last_regeneration: string;
}

export interface AccountKeys {
  public_key: string;
  did: string;
}

// Reputation types
export interface ReputationScore {
  score: number;
  frozen?: boolean;
}

// Mesh computing types
export interface MeshJobSubmitRequest {
  command: string;
  args: string[];
  max_cost: number;
  timeout_seconds?: number;
  resources?: {
    cpu_cores: number;
    memory_mb: number;
    disk_mb: number;
  };
}

export interface MeshJobResponse {
  job_id: string;
  status: string;
}

// WebSocket types
export interface WebSocketEvent {
  type: 'ProposalStatusChanged' | 'JobProgressUpdated' | 'NewFederationPeer' | 'ManaBalanceChanged' | 'NetworkEvent';
  data: any;
}

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

  constructor(config: ICNClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set authentication headers
    if (config.apiKey) {
      this.client.defaults.headers.common['x-api-key'] = config.apiKey;
    }
    if (config.bearerToken) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${config.bearerToken}`;
    }

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

  // Authentication methods
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

  // System API namespace
  get system() {
    const client = this.client;
    return {
      async getInfo(): Promise<NodeInfo> {
        const response = await client.get<NodeInfo>('/info');
        return response.data;
      },

      async getStatus(): Promise<NodeStatus> {
        const response = await client.get<NodeStatus>('/status');
        return response.data;
      },

      async getHealth(): Promise<{ status: string; timestamp: string }> {
        const response = await client.get<{ status: string; timestamp: string }>('/health');
        return response.data;
      },

      async getMetrics(): Promise<string> {
        const response = await client.get<string>('/metrics');
        return response.data;
      }
    };
  }

  // Account API namespace
  get account() {
    const client = this.client;
    return {
      async getCurrentAccountInfo(): Promise<{ did: string; mana: number }> {
        // Get account info from node info endpoint since /account/{did}/mana doesn't exist yet
        const nodeInfo = await client.get<NodeInfo>('/info');
        const match = nodeInfo.data.status_message.match(/Node DID: (.+?), Mana: (\d+)/);
        if (match) {
          return {
            did: match[1],
            mana: parseInt(match[2], 10)
          };
        }
        return { did: 'unknown', mana: 0 };
      },

      async getManaBalance(_did: string): Promise<ManaBalance> {
        // Fallback to parsing from node info for now
        const nodeInfo = await client.get<NodeInfo>('/info');
        const match = nodeInfo.data.status_message.match(/Mana: (\d+)/);
        return {
          balance: match ? parseInt(match[1], 10) : 0,
          capacity: 1000, // Default values since endpoint doesn't exist yet
          regeneration_rate: 1.0,
          last_regeneration: new Date().toISOString()
        };
      },

      async getKeys(): Promise<AccountKeys> {
        const response = await client.get<AccountKeys>('/keys');
        return response.data;
      }
    };
  }

  // Reputation API namespace
  get reputation() {
    const client = this.client;
    return {
      async getScore(did: Did): Promise<ReputationScore> {
        const response = await client.get<ReputationScore>(`/reputation/${did}`);
        return response.data;
      }
    };
  }

  // Mesh computing API namespace
  get mesh() {
    const client = this.client;
    const normalizeJobStatus = this.normalizeJobStatus.bind(this);
    return {
      async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
        const response = await client.post<SubmitJobResponse>('/mesh/submit', request);
        return response.data;
      },

      async listJobs(): Promise<MeshJob[]> {
        const response = await client.get<{ jobs: any[] }>('/mesh/jobs');
        return response.data.jobs.map(job => ({
          id: job.job_id,
          submitter: 'unknown',
          executor: job.status?.executor || undefined,
          status: normalizeJobStatus(job.status),
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
        }));
      },

      async getJob(jobId: JobId): Promise<MeshJob> {
        const response = await client.get<any>(`/mesh/jobs/${jobId}`);
        const job = response.data;
        
        return {
          id: job.job_id,
          submitter: 'unknown',
          executor: job.status?.executor || undefined,
          status: normalizeJobStatus(job.status),
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
    };
  }

  // Governance API namespace
  get governance() {
    const client = this.client;
    return {
      async submitProposal(proposal: SubmitProposalRequest): Promise<{ proposal_id: string }> {
        const response = await client.post<string>('/governance/submit', proposal);
        return { proposal_id: response.data };
      },

      async listProposals(): Promise<Proposal[]> {
        const response = await client.get<Proposal[]>('/governance/proposals');
        return response.data;
      },

      async getProposal(proposalId: ProposalId): Promise<Proposal> {
        const response = await client.get<Proposal>(`/governance/proposal/${proposalId}`);
        return response.data;
      },

      async castVote(voteRequest: CastVoteRequest): Promise<void> {
        await client.post(`/governance/vote`, voteRequest);
      }
    };
  }

  // Federation API namespace
  get federation() {
    const client = this.client;
    return {
      async listPeers(): Promise<string[]> {
        const response = await client.get<string[]>('/federation/peers');
        return response.data;
      },

      async getStatus(): Promise<FederationStatus> {
        const response = await client.get<FederationStatus>('/federation/status');
        return response.data;
      }
    };
  }

  // Network API namespace
  get network() {
    const client = this.client;
    return {
      async getPeers(): Promise<string[]> {
        const response = await client.get<string[]>('/network/peers');
        return response.data;
      },

      async getLocalPeerId(): Promise<{ peer_id: string }> {
        const response = await client.get<{ peer_id: string }>('/network/local-peer-id');
        return response.data;
      }
    };
  }

  // DAG API namespace
  get dag() {
    const client = this.client;
    return {
      async putBlock(block: DagBlock): Promise<Cid> {
        const response = await client.post<string>('/dag/put', block);
        return response.data;
      },

      async getBlock(cid: Cid): Promise<DagBlock> {
        const response = await client.post<DagBlock>('/dag/get', { cid });
        return response.data;
      },

      async getRoot(): Promise<{ root: Cid | null }> {
        const response = await client.get<{ root: Cid | null }>('/dag/root');
        return response.data;
      },

      async getStatus(): Promise<{ current_root: Cid | null; in_sync: boolean }> {
        const response = await client.get<{ current_root: Cid | null; in_sync: boolean }>('/dag/status');
        return response.data;
      }
    };
  }

  // Legacy methods for backward compatibility
  async getNodeInfo(): Promise<NodeInfo> {
    return this.system.getInfo();
  }

  async getNodeStatus(): Promise<NodeStatus> {
    return this.system.getStatus();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.system.getHealth();
  }

  async getCurrentAccountInfo(): Promise<{ did: string; mana: number }> {
    return this.account.getCurrentAccountInfo();
  }

  async getReputation(did: Did): Promise<{ score: number; frozen?: boolean }> {
    return this.reputation.getScore(did);
  }

  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    return this.mesh.submitJob(request);
  }

  async getJobs(): Promise<MeshJob[]> {
    return this.mesh.listJobs();
  }

  async getJob(jobId: JobId): Promise<MeshJob> {
    return this.mesh.getJob(jobId);
  }

  async submitProposal(proposal: SubmitProposalRequest): Promise<{ proposal_id: string }> {
    return this.governance.submitProposal(proposal);
  }

  async getProposals(): Promise<Proposal[]> {
    return this.governance.listProposals();
  }

  async getProposal(proposalId: ProposalId): Promise<Proposal> {
    return this.governance.getProposal(proposalId);
  }

  async vote(voteRequest: CastVoteRequest): Promise<void> {
    return this.governance.castVote(voteRequest);
  }

  async getNetworkPeers(): Promise<string[]> {
    return this.network.getPeers();
  }

  async getLocalPeerId(): Promise<{ peer_id: string }> {
    return this.network.getLocalPeerId();
  }

  async getFederationPeers(): Promise<string[]> {
    return this.federation.listPeers();
  }

  async getFederationStatus(): Promise<FederationStatus> {
    return this.federation.getStatus();
  }

  async getMetrics(): Promise<string> {
    return this.system.getMetrics();
  }

  // Utility methods
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
}

// WebSocket client for real-time updates
export class ICNWebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(private config: { baseUrl: string; apiKey?: string }) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.baseUrl.replace(/^http/, 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.config.apiKey) {
          this.ws?.send(JSON.stringify({ type: 'auth', apiKey: this.config.apiKey }));
        }
        resolve();
      };

      this.ws.onerror = (error) => reject(error);
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          const listeners = this.listeners.get(message.type) || [];
          listeners.forEach(listener => listener(message.data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    });
  }

  subscribe(eventType: string, listener: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  unsubscribe(eventType: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}

// Create enhanced singleton instance
export const icnApi = new ICNApiClient({
  baseUrl: 'http://localhost:7845'
});

// Export the class for testing or custom instances
export default ICNApiClient;
