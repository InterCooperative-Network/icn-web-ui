// ICN API Types
// These types mirror the API contracts defined in icn-core/crates/icn-api

export type Did = string;
export type JobId = string;
export type ProposalId = string;
export type BlockId = string;
export type Cid = string;

// Node Information Types
export interface NodeInfo {
  name: string;
  version: string;
  status_message: string;
}

export interface NodeStatus {
  is_online: boolean;
  peer_count: number;
  current_block_height: number;
  version: string;
}

// DAG Types
export interface DagBlock {
  cid: Cid;
  data: any;
  links?: Cid[];
  timestamp?: number;
  author_did?: Did;
  signature?: string;
  scope?: string;
}

// Account and Mana Types
export interface ManaAccount {
  did: Did;
  mana_balance: number;
  mana_capacity: number;
  regeneration_rate: number;
  last_regeneration: string; // ISO date string
  reputation_score: number;
  account_level: AccountLevel;
}

export type AccountLevel = 'Basic' | 'Verified' | 'Trusted' | 'Elite';

export interface ManaTransaction {
  id: string;
  account: Did;
  amount: number; // Negative for spending, positive for earning
  transaction_type: 'JobSubmission' | 'JobExecution' | 'Transfer' | 'Regeneration';
  timestamp: string; // ISO date string
  description?: string;
}

// Job Types - Updated to match actual API responses
export interface MeshJob {
  id: JobId;
  submitter: Did;
  executor?: Did;
  status: JobStatus;
  spec: JobSpecification;
  max_cost: number;
  actual_cost?: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  completed_at?: string; // ISO date string
  result?: JobResult;
  error?: string;
}

// Updated to match actual API status values
export type JobStatus =
  | 'Pending' | 'pending'
  | 'Bidding' | 'bidding'
  | 'Assigned' | 'assigned'
  | 'Running' | 'running'
  | 'Completed' | 'completed'
  | 'Failed' | 'failed'
  | 'Cancelled' | 'cancelled'
  | 'Unknown';

export interface JobSpecification {
  command: string;
  args: string[];
  environment: Record<string, string>;
  resources: ResourceRequirements;
  timeout_seconds?: number;
}

export interface ResourceRequirements {
  cpu_cores: number;
  memory_mb: number;
  disk_mb: number;
  network_bandwidth?: number;
}

export interface JobResult {
  success: boolean;
  exit_code?: number;
  stdout?: string;
  stderr?: string;
  execution_time_ms: number;
  resources_used: ResourceUsage;
}

export interface ResourceUsage {
  cpu_time_ms: number;
  memory_peak_mb: number;
  disk_used_mb: number;
  network_bytes: number;
}

export interface JobBid {
  id: string;
  job_id: JobId;
  executor: Did;
  cost_bid: number;
  estimated_duration_seconds: number;
  capabilities: ExecutorCapabilities;
  reputation_score: number;
  submitted_at: string; // ISO date string
}

export interface ExecutorCapabilities {
  cpu_cores: number;
  memory_mb: number;
  disk_mb: number;
  supported_environments: string[];
  network_bandwidth: number;
}

// Governance Types
export interface Proposal {
  id: ProposalId;
  proposer: Did;
  title: string;
  description: string;
  proposal_type: ProposalType;
  changes: ParameterChange[];
  status: ProposalStatus;
  voting_period_end: string; // ISO date string
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  created_at: string; // ISO date string
}

export type ProposalType =
  | 'ParameterChange'
  | 'PolicyUpdate'
  | 'NetworkUpgrade'
  | 'ResourceAllocation';
export type ProposalStatus = 'Draft' | 'Voting' | 'Passed' | 'Rejected' | 'Executed' | 'Expired';

export interface ParameterChange {
  parameter: string;
  current_value: any;
  proposed_value: any;
  justification: string;
}

export interface Vote {
  id: string;
  proposal_id: ProposalId;
  voter: Did;
  vote_type: VoteType;
  voting_power: number;
  timestamp: string; // ISO date string
  reason?: string;
}

export type VoteType = 'For' | 'Against' | 'Abstain';

// Network Types
export interface NetworkPeer {
  id: string;
  did: Did;
  address: string;
  status: PeerStatus;
  reputation_score: number;
  capabilities: ExecutorCapabilities;
  last_seen: string; // ISO date string
  uptime_percentage: number;
}

export type PeerStatus = 'Online' | 'Offline' | 'Connecting' | 'Disconnected';

export interface NetworkStats {
  total_peers: number;
  active_peers: number;
  total_jobs_submitted: number;
  total_jobs_completed: number;
  total_mana_in_circulation: number;
  network_hashrate?: number;
  average_job_completion_time_ms: number;
}

// API Request/Response Types - Updated to match actual icn-core API
export interface SubmitJobRequest {
  manifest_cid: string;
  spec_bytes?: string; // Base64 encoded bincode JobSpec bytes
  spec_json?: any; // Deprecated JSON representation
  cost_mana: number;
}

export type JobPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface SubmitJobResponse {
  job_id: JobId;
}

export interface ApiError {
  error: string;
  error_code: string;
  message: string;
  details?: any;
  timestamp: string; // ISO date string
  request_id: string;
}

// Utility Types
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
