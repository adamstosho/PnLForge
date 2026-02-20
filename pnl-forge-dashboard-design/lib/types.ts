// Core Trade Model - Canonical representation
export interface Trade {
  id: string;
  wallet_address: string;
  market: string;
  symbol: string;
  side: 'long' | 'short';
  order_type: 'market' | 'limit' | 'other';
  size: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  pnl: number;
  fees: number;
  fees_breakdown: {
    maker: number;
    taker: number;
    other: number;
  };
  tags: string[];
  notes_encrypted?: string;
  notes?: string;
  reviewed?: boolean;
  metadata?: Record<string, unknown>;
}

// API Response Types
export interface SummaryResponse {
  wallet: string;
  kpis: {
    total_pnl: number;
    win_rate: number;
    max_drawdown_pct: number;
    sharpe: number;
    sortino: number;
    trades_count: number;
    avg_win: number;
    avg_loss: number;
    largest_gain: number;
    largest_loss: number;
    avg_duration_minutes: number;
    long_ratio: number;
    short_ratio: number;
    total_fees: number;
    expectancy: number;
  };
  equity_curve: Array<{ ts: string; equity: number }>;
  daily_pnl: Array<{ date: string; pnl: number }>;
  status: 'ready' | 'processing' | 'error';
  last_updated: string;
}

export interface TradesResponse {
  trades: Trade[];
  total_count: number;
  page: number;
  limit: number;
}

// Filter & Query Types
export interface TradeFilters {
  symbol?: string;
  from_date?: string;
  to_date?: string;
  side?: 'long' | 'short';
  pnl_sign?: 'profit' | 'loss';
  tag?: string;
  reviewed?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: 'newest' | 'oldest' | 'pnl_desc' | 'pnl_asc';
}

// Analytics Data
export interface EquityPoint {
  timestamp: string;
  date: string;
  equity: number;
  cumulative_pnl: number;
  drawdown_pct: number;
}

export interface DailyMetrics {
  date: string;
  pnl: number;
  trades_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  fees: number;
}

export interface TimeOfDayMetrics {
  hour: number;
  pnl: number;
  trades_count: number;
  win_rate: number;
}

export interface SessionMetrics {
  session: string;
  pnl: number;
  trades_count: number;
  win_rate: number;
  avg_duration: number;
}

// Chart Data
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface HeatmapData {
  day: string;
  hour: number;
  pnl: number;
  trades: number;
}

// User Session
export interface UserSession {
  wallet_address: string;
  token: string;
  refresh_token?: string;
  expires_at: number;
}

// Simulator Input/Output
export interface SimulatorInput {
  multiplier: number;
  stop_loss_pct: number;
  exclude_worst_trades: number;
}

export interface SimulatorOutput {
  original_equity: EquityPoint[];
  simulated_equity: EquityPoint[];
  original_metrics: {
    final_balance: number;
    max_drawdown: number;
    sharpe: number;
    win_rate: number;
  };
  simulated_metrics: {
    final_balance: number;
    max_drawdown: number;
    sharpe: number;
    win_rate: number;
  };
  differences: {
    balance_change: number;
    drawdown_change: number;
    sharpe_change: number;
  };
}

// AI Assistant
export interface AIQuery {
  query: string;
  context_options?: {
    include_notes?: boolean;
    include_last_n_trades?: number;
  };
}

export interface AIResponse {
  answer_text: string;
  charts: Array<{
    type: string;
    data: ChartDataPoint[];
    title: string;
  }>;
  metrics_references: string[];
  sources: string[];
}

// Settings
export interface UserSettings {
  timezone: string;
  base_currency: string;
  risk_free_rate: number;
  date_format: string;
  encryption_mode: 'server' | 'client';
  ai_note_sharing_enabled: boolean;
  community_benchmarks_enabled: boolean;
}

// Tags & Journal
export interface TagAggregate {
  tag: string;
  total_pnl: number;
  trades_count: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  expectancy: number;
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  max_progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}
