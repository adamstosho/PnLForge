/**
 * Supabase Client Configuration - PRODUCTION READY
 * For Next.js Server Components and API Routes
 */

import { createClient } from '@supabase/supabase-js'
import type { Trade } from './types'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Client-side Supabase client (uses anon key)
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export type Database = any

// Encryption helper for notes
function encryptNote(note: string, walletAddress: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.createHash('sha256').update(walletAddress + (process.env.JWT_SECRET || 'default-secret')).digest()
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv)
  let encrypted = cipher.update(note, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

function decryptNote(encryptedNote: string, walletAddress: string): string {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedNote.split(':')
    const algorithm = 'aes-256-gcm'
    const key = crypto.createHash('sha256').update(walletAddress + (process.env.JWT_SECRET || 'default-secret')).digest()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key.slice(0, 32), iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return ''
  }
}

/**
 * Database utility functions - Real Supabase implementation
 */

export async function getUserByWallet(walletAddress: string) {
  if (!supabaseServer) {
    console.warn('Supabase not configured, returning null')
    return null
  }
  
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching user:', error)
  }
  
  return data
}

export async function createOrUpdateUser(walletAddress: string, userData?: any) {
  if (!supabaseServer) {
    console.warn('Supabase not configured')
    return { wallet_address: walletAddress, ...userData }
  }
  
  const { data, error } = await supabaseServer
    .from('users')
    .upsert({
      wallet_address: walletAddress,
      ...userData,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'wallet_address'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating/updating user:', error)
    return { wallet_address: walletAddress, ...userData }
  }
  
  return data
}

export async function saveUserTrades(walletAddress: string, trades: Trade[]) {
  if (!supabaseServer || trades.length === 0) {
    return trades
  }
  
  // Prepare trades for insertion
  const tradesToInsert = trades.map(trade => ({
    id: trade.id,
    wallet_address: walletAddress,
    market: trade.market,
    symbol: trade.symbol,
    side: trade.side,
    order_type: trade.order_type,
    size: trade.size,
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    entry_time: trade.entry_time,
    exit_time: trade.exit_time,
    pnl: trade.pnl,
    fees: trade.fees,
    fees_breakdown: trade.fees_breakdown,
    tags: trade.tags || [],
    notes_encrypted: trade.notes ? encryptNote(trade.notes, walletAddress) : null,
    reviewed: trade.reviewed || false,
    metadata: trade.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
  
  const { data, error } = await supabaseServer
    .from('trades')
    .upsert(tradesToInsert, {
      onConflict: 'id',
      ignoreDuplicates: false
    })
  
  if (error) {
    console.error('Error saving trades:', error)
    throw error
  }
  
  return trades
}

export async function getUserTrades(walletAddress: string, limit: number = 1000) {
  if (!supabaseServer) {
    return []
  }
  
  const { data, error } = await supabaseServer
    .from('trades')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('exit_time', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching trades:', error)
    return []
  }
  
  // Decrypt notes and map to Trade type
  return (data || []).map((row: any) => ({
    id: row.id,
    wallet_address: row.wallet_address,
    market: row.market,
    symbol: row.symbol,
    side: row.side,
    order_type: row.order_type,
    size: parseFloat(row.size),
    entry_price: parseFloat(row.entry_price),
    exit_price: parseFloat(row.exit_price),
    entry_time: row.entry_time,
    exit_time: row.exit_time,
    pnl: parseFloat(row.pnl),
    fees: parseFloat(row.fees),
    fees_breakdown: row.fees_breakdown || { maker: 0, taker: 0, other: 0 },
    tags: row.tags || [],
    notes: row.notes_encrypted ? decryptNote(row.notes_encrypted, walletAddress) : undefined,
    reviewed: row.reviewed || false,
    metadata: row.metadata || {},
  })) as Trade[]
}

export async function updateTradeAnnotation(
  tradeId: string,
  notes: string,
  tags: string[] = [],
  reviewed: boolean = false,
  walletAddress: string
) {
  if (!supabaseServer) {
    return { id: tradeId, notes_encrypted: notes, tags, reviewed }
  }
  
  const { data, error } = await supabaseServer
    .from('trades')
    .update({
      notes_encrypted: notes ? encryptNote(notes, walletAddress) : null,
      tags,
      reviewed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tradeId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating trade annotation:', error)
    return { id: tradeId, notes_encrypted: notes, tags, reviewed }
  }
  
  return {
    ...data,
    notes: notes,
  }
}

export async function getSyncStatus(walletAddress: string) {
  if (!supabaseServer) {
    return {
      wallet_address: walletAddress,
      status: 'ready',
      last_sync: new Date().toISOString(),
      sync_count: 0,
    }
  }
  
  const { data, error } = await supabaseServer
    .from('sync_status')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching sync status:', error)
  }
  
  return data || {
    wallet_address: walletAddress,
    status: 'ready',
    last_sync: new Date().toISOString(),
    sync_count: 0,
  }
}

export async function updateSyncStatus(
  walletAddress: string,
  status: 'idle' | 'syncing' | 'ready',
  metadata?: any
) {
  if (!supabaseServer) {
    return {
      wallet_address: walletAddress,
      status,
      updated_at: new Date().toISOString(),
      ...metadata,
    }
  }
  
  const { data, error } = await supabaseServer
    .from('sync_status')
    .upsert({
      wallet_address: walletAddress,
      status,
      last_sync: new Date().toISOString(),
      ...metadata,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'wallet_address'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error updating sync status:', error)
    return {
      wallet_address: walletAddress,
      status,
      updated_at: new Date().toISOString(),
      ...metadata,
    }
  }
  
  return data
}

export async function logAuditEvent(
  walletAddress: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: any
) {
  if (!supabaseServer) {
    return {
      wallet_address: walletAddress,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: changes,
      created_at: new Date().toISOString(),
    }
  }
  
  const { data, error } = await supabaseServer
    .from('audit_log')
    .insert({
      wallet_address: walletAddress,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: changes,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error logging audit event:', error)
    return {
      wallet_address: walletAddress,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: changes,
      created_at: new Date().toISOString(),
    }
  }
  
  return data
}

export default {
  supabaseClient,
  supabaseServer,
  getUserByWallet,
  createOrUpdateUser,
  saveUserTrades,
  getUserTrades,
  updateTradeAnnotation,
  getSyncStatus,
  updateSyncStatus,
  logAuditEvent,
}
