'use client'

import { useState } from 'react'
import { useFilters } from '@/lib/filter-context'
import { Save, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const { filteredTrades, allTrades } = useFilters()
  const [settings, setSettings] = useState({
    timezone: 'UTC+1',
    baseCurrency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    riskFreeRate: 0.01,
    encryptionMode: 'server',
    aiNoteSharing: false,
    communityBenchmarks: true,
  })
  const [saved, setSaved] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // In a real app, this would save to localStorage or API
    localStorage.setItem('pnlforge-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const exportData = () => {
    const headers = ['Date', 'Symbol', 'Side', 'Size', 'Entry', 'Exit', 'PnL', 'Fees', 'Tags']
    const rows = allTrades.map(t => [
      new Date(t.exit_time).toISOString(),
      t.symbol,
      t.side,
      t.size,
      t.entry_price,
      t.exit_price,
      t.pnl,
      t.fees,
      t.tags.join(';')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pnlforge-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-muted-900">Settings</h1>
        <p className="text-muted-600 mt-1">Manage your preferences and account</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-md text-success">
          Settings saved successfully!
        </div>
      )}

      {/* General Settings */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <h2 className="text-xl font-bold text-muted-900 mb-6">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-4 py-2 border border-muted-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="UTC">UTC</option>
              <option value="UTC+1">WAT (UTC+1)</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">Base Currency</label>
            <select
              value={settings.baseCurrency}
              onChange={(e) => handleChange('baseCurrency', e.target.value)}
              className="w-full px-4 py-2 border border-muted-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="USDC">USDC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 border border-muted-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">
              Risk-Free Rate (for Sharpe/Sortino)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={settings.riskFreeRate}
              onChange={(e) => handleChange('riskFreeRate', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-muted-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-muted-500 mt-1">Value between 0 and 1 (e.g., 0.01 for 1%)</p>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <h2 className="text-xl font-bold text-muted-900 mb-6">Privacy & Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-700 mb-2">Trade Notes Encryption</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="encryption"
                  value="server"
                  checked={settings.encryptionMode === 'server'}
                  onChange={(e) => handleChange('encryptionMode', e.target.value)}
                  className="text-primary-500"
                />
                <span className="text-sm text-muted-700">Server-side (standard)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="encryption"
                  value="client"
                  checked={settings.encryptionMode === 'client'}
                  onChange={(e) => handleChange('encryptionMode', e.target.value)}
                  className="text-primary-500"
                />
                <span className="text-sm text-muted-700">Client-side (maximum privacy)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted-50 rounded-md">
            <div>
              <p className="font-medium text-muted-900">AI Assistant Note Analysis</p>
              <p className="text-xs text-muted-600">Allow AI to read notes for better analysis</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={settings.aiNoteSharing}
                onChange={(e) => handleChange('aiNoteSharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-muted-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted-50 rounded-md">
            <div>
              <p className="font-medium text-muted-900">Community Benchmarks</p>
              <p className="text-xs text-muted-600">Compare with anonymized traders</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={settings.communityBenchmarks}
                onChange={(e) => handleChange('communityBenchmarks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-muted-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-lg border border-muted-300 bg-surface p-6 shadow-md">
        <h2 className="text-xl font-bold text-muted-900 mb-6">Data Management</h2>
        <div className="space-y-4">
          <button
            onClick={exportData}
            className="w-full px-6 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors"
          >
            Export All Data (CSV)
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-6 py-3 border border-danger text-danger rounded-md font-medium hover:bg-danger/10 transition-colors"
          >
            Delete Account & All Data
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-bg rounded-lg max-w-md w-full p-6 shadow-2xl border border-muted-300">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-muted-900 mb-2">Delete Account?</h3>
                <p className="text-sm text-muted-700">
                  This action cannot be undone. All your trades, notes, and settings will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-muted-300 text-muted-700 rounded-md font-medium hover:bg-muted-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In real app, would call API to delete account
                  alert('Account deletion would happen here')
                  setShowDeleteModal(false)
                }}
                className="flex-1 px-4 py-2 bg-danger text-white rounded-md font-medium hover:bg-danger/90 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
