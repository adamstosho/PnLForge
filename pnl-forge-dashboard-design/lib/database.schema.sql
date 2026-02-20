-- Deriverse Trading Analytics Dashboard - Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table (canonical trade model)
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  market TEXT NOT NULL DEFAULT 'Deriverse',
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  order_type TEXT CHECK (order_type IN ('market', 'limit', 'other')),
  size NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE NOT NULL,
  pnl NUMERIC NOT NULL DEFAULT 0,
  fees NUMERIC NOT NULL DEFAULT 0,
  fees_breakdown JSONB DEFAULT '{"maker": 0, "taker": 0, "other": 0}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  notes_encrypted TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_wallet_time ON trades(wallet_address, exit_time DESC);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_exit_time ON trades(exit_time DESC);
CREATE INDEX IF NOT EXISTS idx_trades_side ON trades(side);
CREATE INDEX IF NOT EXISTS idx_trades_pnl ON trades(pnl);

-- Sync status table
CREATE TABLE IF NOT EXISTS sync_status (
  wallet_address TEXT PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'syncing', 'ready')),
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_count INTEGER DEFAULT 0,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_wallet ON audit_log(wallet_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- Daily aggregates table (for caching and performance)
CREATE TABLE IF NOT EXISTS daily_aggregates (
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
  day DATE NOT NULL,
  total_pnl NUMERIC DEFAULT 0,
  trades_count INTEGER DEFAULT 0,
  wins_count INTEGER DEFAULT 0,
  losses_count INTEGER DEFAULT 0,
  fees_total NUMERIC DEFAULT 0,
  avg_trade_duration_seconds NUMERIC,
  volatility NUMERIC,
  PRIMARY KEY (wallet_address, day)
);

CREATE INDEX IF NOT EXISTS idx_daily_agg_day ON daily_aggregates(day DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can view own sync status" ON sync_status
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can view own audit logs" ON audit_log
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can view own aggregates" ON daily_aggregates
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access trades" ON trades
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sync" ON sync_status
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access audit" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access aggregates" ON daily_aggregates
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily aggregates (can be called periodically)
CREATE OR REPLACE FUNCTION update_daily_aggregates(wallet_addr TEXT, target_day DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_aggregates (wallet_address, day, total_pnl, trades_count, wins_count, losses_count, fees_total, avg_trade_duration_seconds)
  SELECT
    wallet_address,
    DATE(exit_time) as day,
    SUM(pnl) as total_pnl,
    COUNT(*) as trades_count,
    COUNT(*) FILTER (WHERE pnl > 0) as wins_count,
    COUNT(*) FILTER (WHERE pnl < 0) as losses_count,
    SUM(fees) as fees_total,
    AVG(EXTRACT(EPOCH FROM (exit_time - entry_time))) as avg_trade_duration_seconds
  FROM trades
  WHERE wallet_address = wallet_addr
    AND DATE(exit_time) = target_day
  GROUP BY wallet_address, DATE(exit_time)
  ON CONFLICT (wallet_address, day) DO UPDATE SET
    total_pnl = EXCLUDED.total_pnl,
    trades_count = EXCLUDED.trades_count,
    wins_count = EXCLUDED.wins_count,
    losses_count = EXCLUDED.losses_count,
    fees_total = EXCLUDED.fees_total,
    avg_trade_duration_seconds = EXCLUDED.avg_trade_duration_seconds;
END;
$$ LANGUAGE plpgsql;
