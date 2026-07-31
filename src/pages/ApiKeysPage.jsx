import { useState, useEffect, useCallback } from 'react';
import {
  Key, Plus, Trash2, Copy, Check, RefreshCw,
  Shield, Zap, Clock, ChevronDown, ChevronUp, X, ToggleLeft,
  ToggleRight, AlertTriangle, Info, Terminal, Activity, 
  Lock, CheckCircle2, XCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getApiKeyStats,
} from '../services/api/apiKeyService';

// ── Available Permissions ───────────────────────────────────────────────────
const AVAILABLE_PERMISSIONS = [
  { scope: 'leads:read',     label: 'Leads — Read',     description: 'Read leads captured from YouTube comments' },
  { scope: 'leads:write',    label: 'Leads — Write',    description: 'Create new leads via the external API' },
  { scope: 'users:read',     label: 'Users — Read',     description: 'Read the full list of registered users (admin keys only)' },
  { scope: 'customers:read', label: 'Customers — Read', description: 'Read detailed customer profiles with metrics' },
  { scope: 'comments:read',  label: 'Comments — Read',  description: 'Read YouTube comment data and moderation history' },
  { scope: 'analytics:read', label: 'Analytics — Read', description: 'Read channel and content analytics data' },
];

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const RATE_LIMIT_PRESETS = [
  { label: '100 / hr',  value: 100 },
  { label: '500 / hr',  value: 500 },
  { label: '1000 / hr', value: 1000 },
  { label: '5000 / hr', value: 5000 },
  { label: 'Custom',    value: 'custom' },
];

const SCOPE_COLORS = {
  'leads:read':     { bg: '#fff1f1', border: '#fecaca', text: '#dc2626' },
  'leads:write':    { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  'users:read':     { bg: '#fefce8', border: '#fef08a', text: '#ca8a04' },
  'customers:read': { bg: '#fef2f2', border: '#fecaca', text: '#e11d48' },
  'comments:read':  { bg: '#faf5ff', border: '#e9d5ff', text: '#9333ea' },
  'analytics:read': { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
};

const ENDPOINT_DOCS = [
  {
    method: 'GET', path: '/api/external/leads',
    permission: 'leads:read', description: 'Fetch all captured leads from YouTube comments',
    curl: `curl -H "x-api-key: YOUR_KEY" \\\n  https://server-youtube-auto.onrender.com/api/external/leads`
  },
  {
    method: 'POST', path: '/api/external/leads',
    permission: 'leads:write', description: 'Create a new lead record',
    curl: `curl -X POST \\\n  -H "x-api-key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Jane","email":"jane@example.com"}' \\\n  https://server-youtube-auto.onrender.com/api/external/leads`
  },
  {
    method: 'GET', path: '/api/external/users',
    permission: 'users:read', description: 'Fetch all registered users (admin keys only)',
    curl: `curl -H "x-api-key: YOUR_KEY" \\\n  https://server-youtube-auto.onrender.com/api/external/users`
  },
  {
    method: 'GET', path: '/api/external/customers/details',
    permission: 'customers:read', description: 'Fetch detailed customer profiles with metrics',
    curl: `curl -H "x-api-key: YOUR_KEY" \\\n  "https://server-youtube-auto.onrender.com/api/external/customers/details?page=1&limit=20"`
  },
  {
    method: 'GET', path: '/api/external/comments',
    permission: 'comments:read', description: 'Fetch YouTube comments with author details, commenter channel ID, comment text, and video ID',
    curl: `curl -H "x-api-key: YOUR_KEY" \\\n  https://server-youtube-auto.onrender.com/api/external/comments`
  },
  {
    method: 'GET', path: '/api/external/analytics',
    permission: 'analytics:read', description: 'Fetch channel performance and comment analytics',
    curl: `curl -H "x-api-key: YOUR_KEY" \\\n  https://server-youtube-auto.onrender.com/api/external/analytics`
  },
];

// ── Permission Chip ────────────────────────────────────────────────────────────
const PermissionChip = ({ scope }) => {
  const c = SCOPE_COLORS[scope] || { bg: '#fff1f1', border: '#fecaca', text: '#dc2626' };
  return (
    <span className="apk-permission-chip" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      letterSpacing: '0.02em', whiteSpace: 'nowrap'
    }}>
      {scope}
    </span>
  );
};

// ── Copy Button ────────────────────────────────────────────────────────────────
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <button onClick={handleCopy} className="apk-copy-btn" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 8, border: `1px solid ${copied ? '#fca5a5' : '#e2e8f0'}`,
      background: copied ? '#fef2f2' : '#f8fafc',
      color: copied ? '#dc2626' : '#475569', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all .2s'
    }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

// ── Create Key Modal ──────────────────────────────────────────────────────────
const CreateKeyModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState(AVAILABLE_PERMISSIONS.map(p => p.scope));
  const [rateLimitPreset, setRateLimitPreset] = useState(500);
  const [customRpm, setCustomRpm] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdKey, setCreatedKey] = useState(null);

  const togglePerm = (scope) => {
    setSelectedPerms(prev => prev.includes(scope) ? prev.filter(p => p !== scope) : [...prev, scope]);
  };

  const toggleAll = () => {
    if (selectedPerms.length === AVAILABLE_PERMISSIONS.length) {
      setSelectedPerms([]);
    } else {
      setSelectedPerms(AVAILABLE_PERMISSIONS.map(p => p.scope));
    }
  };

  const getRph = () => rateLimitPreset === 'custom' ? (parseInt(customRpm) || 500) : rateLimitPreset;

  const handleCreate = async () => {
    if (!name.trim()) { setError('Key name is required.'); return; }
    if (selectedPerms.length === 0) { setError('Select at least one permission.'); return; }
    setLoading(true); setError('');
    try {
      const res = await createApiKey({
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPerms,
        rateLimit: { requestsPerHour: getRph() },
        expiresAt: expiresAt || null
      });
      setCreatedKey(res.data.apiKey);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create API key.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="apk-card-bg" style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 24, width: '100%', maxWidth: 580, maxHeight: '92vh',
        overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: '#fff1f1', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(255,0,0,0.1)'
            }}>
              <Key size={22} color="#ff0000" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#0f172a' }}>
                {createdKey ? '🎉 Key Created Successfully' : 'Create API Key'}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {createdKey ? 'Copy your key now — it won\'t be shown again.' : 'Configure permissions and rate limits'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            borderRadius: 10, color: '#64748b', cursor: 'pointer', padding: '6px 8px',
            display: 'flex', alignItems: 'center'
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 28px 28px' }}>
          {/* Success view */}
          {createdKey ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 16, padding: 20 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={17} /> Key generated — copy it now!
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <code style={{
                    flex: 1, background: '#ffffff', border: '1px solid #fecaca', borderRadius: 10,
                    padding: '10px 14px', fontSize: 13, color: '#b91c1c', fontFamily: 'monospace',
                    wordBreak: 'break-all', minWidth: 0, fontWeight: 700
                  }}>{createdKey.key}</code>
                  <CopyButton text={createdKey.key} label="Copy Key" />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(createdKey.permissions || []).map(p => <PermissionChip key={p} scope={p} />)}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Rate Limit</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{createdKey.rateLimit?.requestsPerHour || 500} req/hr</div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Expires</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatDate(createdKey.expiresAt) || 'Never'}</div>
                </div>
              </div>
              <button onClick={onClose} style={{
                padding: '12px', borderRadius: 12, background: '#ff0000',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14,
                boxShadow: '0 4px 14px rgba(255,0,0,0.3)'
              }}>Done</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Key Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Production Mobile App"
                  style={{ width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 500 }}>(optional)</span></label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this key used for?"
                  style={{ width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
                />
              </div>

              {/* Permissions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Permissions <span style={{ color: '#dc2626', fontWeight: 800 }}>({selectedPerms.length} selected)</span>
                  </label>
                  <button onClick={toggleAll} style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8,
                    color: '#475569', cursor: 'pointer', padding: '4px 10px', fontSize: 11, fontWeight: 700
                  }}>
                    {selectedPerms.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const checked = selectedPerms.includes(p.scope);
                    const c = SCOPE_COLORS[p.scope] || { border: '#fecaca', text: '#dc2626', bg: '#fff1f1' };
                    return (
                      <label key={p.scope} onClick={() => togglePerm(p.scope)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                        background: checked ? c.bg : '#f8fafc',
                        border: `1px solid ${checked ? c.border : '#e2e8f0'}`,
                        borderRadius: 12, cursor: 'pointer', transition: 'all .15s', userSelect: 'none'
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? c.text : '#94a3b8'}`,
                          background: checked ? c.text : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s', flexShrink: 0
                        }}>
                          {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: checked ? c.text : '#334155' }}>{p.scope}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{p.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rate Limit */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 9, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rate Limit</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {RATE_LIMIT_PRESETS.map(p => (
                    <button key={p.value} onClick={() => setRateLimitPreset(p.value)} style={{
                      padding: '8px 16px', borderRadius: 10, border: `1px solid ${rateLimitPreset === p.value ? '#fecaca' : '#cbd5e1'}`,
                      background: rateLimitPreset === p.value ? '#fff1f1' : '#f8fafc',
                      color: rateLimitPreset === p.value ? '#dc2626' : '#475569',
                      cursor: 'pointer', fontSize: 12, fontWeight: 800, transition: 'all .15s'
                    }}>{p.label}</button>
                  ))}
                </div>
                {rateLimitPreset === 'custom' && (
                  <input value={customRpm} onChange={e => setCustomRpm(e.target.value)} placeholder="e.g. 2000"
                    type="number" min="1" max="10000"
                    style={{ marginTop: 10, width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                )}
              </div>

              {/* Expiry */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Expiry Date <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 500 }}>(leave blank for no expiry)</span>
                </label>
                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 600 }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={onClose} style={{
                  flex: 1, padding: '12px', borderRadius: 12, background: '#f1f5f9',
                  color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700, fontSize: 14
                }}>Cancel</button>
                <button onClick={handleCreate} disabled={loading} style={{
                  flex: 2, padding: '12px', borderRadius: 12,
                  background: loading ? '#94a3b8' : '#ff0000',
                  color: '#fff', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(255,0,0,0.3)',
                  transition: 'all .2s'
                }}>
                  {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Plus size={16} /> Generate API Key</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteConfirmModal = ({ keyName, onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff1f1', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={20} color="#dc2626" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Revoke API Key</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>This action cannot be undone</p>
        </div>
      </div>
      <p style={{ fontSize: 14, color: '#475569', margin: '0 0 24px', lineHeight: 1.6 }}>
        Permanently revoke <strong style={{ color: '#0f172a' }}>"{keyName}"</strong>? Any external application using this key will be disconnected immediately.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{
          flex: 1, padding: '11px', borderRadius: 10, background: '#dc2626',
          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 4px 14px rgba(220,38,38,0.25)'
        }}>
          {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />} Revoke
        </button>
      </div>
    </div>
  </div>
);

// ── Key Card ──────────────────────────────────────────────────────────────────
const KeyCard = ({ keyData, onDelete, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [showKey, setShowKey] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteApiKey(keyData._id); onDelete(keyData._id); } catch {}
    setDeleting(false); setShowDelete(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    try { await updateApiKey(keyData._id, { isActive: !keyData.isActive }); onToggle(keyData._id, !keyData.isActive); } catch {}
    setToggling(false);
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try { const res = await getApiKeyStats(keyData._id); setStats(res.data.stats); } catch {}
    setLoadingStats(false);
  };

  useEffect(() => { if (expanded) loadStats(); }, [expanded]);

  const isExpired = keyData.expiresAt && new Date() > new Date(keyData.expiresAt);
  const displayKey = showKey ? (keyData.rawKey || keyData.key) : keyData.key;

  return (
    <>
      {showDelete && <DeleteConfirmModal keyName={keyData.name} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleting} />}
      <div className="apk-card-bg" style={{
        background: '#ffffff', border: `1px solid ${isExpired ? '#fecaca' : '#e2e8f0'}`,
        borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all .2s',
      }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 4, flexShrink: 0, background: isExpired ? '#dc2626' : keyData.isActive ? '#ff0000' : '#cbd5e1' }} />
          <div style={{ flex: 1 }}>
            {/* Card Header */}
            <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: isExpired ? '#fef2f2' : keyData.isActive ? '#fff1f1' : '#f8fafc',
                border: `1px solid ${isExpired ? '#fecaca' : keyData.isActive ? '#fecaca' : '#e2e8f0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isExpired ? <XCircle size={20} color="#dc2626" /> : keyData.isActive ? <Key size={20} color="#ff0000" /> : <Lock size={20} color="#94a3b8" />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{keyData.name}</span>
                  {isExpired && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>EXPIRED</span>}
                  {!keyData.isActive && !isExpired && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>INACTIVE</span>}
                  {keyData.isActive && !isExpired && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: '#fff1f1', color: '#dc2626', border: '1px solid #fecaca' }}>ACTIVE</span>}
                </div>
                {keyData.description && <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{keyData.description}</div>}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <code style={{ fontSize: 12, color: '#0f172a', background: '#f8fafc', padding: '5px 12px', borderRadius: 8, fontFamily: 'monospace', border: '1px solid #cbd5e1', fontWeight: 700, wordBreak: 'break-all' }}>
                    {displayKey}
                  </code>
                  <button onClick={() => setShowKey(prev => !prev)} title={showKey ? 'Hide key' : 'View full key'} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1',
                    background: showKey ? '#fff1f1' : '#f8fafc', color: showKey ? '#dc2626' : '#475569',
                    cursor: 'pointer', transition: 'all .2s'
                  }}>
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <CopyButton text={keyData.rawKey || keyData.key} label="Copy Key" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={handleToggle} disabled={toggling || isExpired} title={keyData.isActive ? 'Deactivate' : 'Activate'} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px',
                  cursor: toggling || isExpired ? 'not-allowed' : 'pointer',
                  color: keyData.isActive ? '#dc2626' : '#94a3b8',
                  display: 'flex', alignItems: 'center', transition: 'all .2s', opacity: toggling ? 0.5 : 1
                }}>
                  {toggling ? <Loader2 size={18} className="spin" /> : keyData.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => setShowDelete(true)} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px',
                  cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', transition: 'color .2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setExpanded(e => !e)} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px',
                  cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center'
                }}>
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(keyData.permissions || []).map(p => <PermissionChip key={p} scope={p} />)}
            </div>

            {/* Meta row */}
            <div style={{ padding: '12px 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 18, borderTop: '1px solid #f1f5f9' }}>
              {[
                { icon: <Zap size={13} color="#ea580c" />, label: `${keyData.rateLimit?.requestsPerHour || 500} req/hr` },
                { icon: <Clock size={13} color="#64748b" />, label: `Expires: ${formatDate(keyData.expiresAt)}` },
                { icon: <Activity size={13} color="#2563eb" />, label: `${(keyData.usageCount || 0).toLocaleString()} total calls` },
                { icon: <Clock size={13} color="#64748b" />, label: `Last used: ${formatDate(keyData.lastUsedAt)}` },
              ].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {item.icon} {item.label}
                </span>
              ))}
            </div>

            {/* Expanded Stats */}
            {expanded && (
              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Hour Usage</span>
                  <button onClick={loadStats} disabled={loadingStats} style={{ background: 'none', border: 'none', color: '#ff0000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
                    <RefreshCw size={13} className={loadingStats ? 'spin' : ''} /> Refresh
                  </button>
                </div>
                {loadingStats ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                    <Loader2 size={14} className="spin" /> Loading stats...
                  </div>
                ) : stats ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {[
                      { label: 'Used (this hr)', value: stats.currentWindow?.used ?? 0, color: '#dc2626' },
                      { label: 'Remaining', value: stats.currentWindow?.remaining ?? (keyData.rateLimit?.requestsPerHour || 500), color: '#16a34a' },
                      { label: 'Limit / hr', value: stats.currentWindow?.limit ?? (keyData.rateLimit?.requestsPerHour || 500), color: '#ca8a04' },
                      { label: 'Lifetime Calls', value: stats.usageCount ?? 0, color: '#2563eb' },
                    ].map(s => (
                      <div key={s.label} style={{ flex: '1 1 120px', background: '#ffffff', borderRadius: 12, padding: '12px 14px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 13, color: '#64748b' }}>Click Refresh to load stats</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Docs Panel ────────────────────────────────────────────────────────────────
const DocsPanel = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const METHOD_COLORS = {
    GET:  { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    POST: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }
  };
  return (
    <div className="apk-card-bg" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff1f1', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Terminal size={14} color="#ff0000" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>Available Endpoints</span>
      </div>
      <div>
        {ENDPOINT_DOCS.map((ep, i) => {
          const mc = METHOD_COLORS[ep.method] || { bg: '#fff1f1', text: '#dc2626', border: '#fecaca' };
          return (
            <div key={i} style={{ borderBottom: i < ENDPOINT_DOCS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left'
              }}>
                <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 800, background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`, minWidth: 42, textAlign: 'center' }}>{ep.method}</span>
                <code style={{ flex: 1, fontSize: 12, color: '#334155', fontFamily: 'monospace', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.path}</code>
                {openIdx === i ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
              </button>
              {openIdx === i && (
                <div style={{ padding: '0 20px 16px' }}>
                  <div style={{ marginBottom: 8 }}><PermissionChip scope={ep.permission} /></div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', fontWeight: 500 }}>{ep.description}</p>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 8, right: 8 }}><CopyButton text={ep.curl} label="Copy" /></div>
                    <pre style={{ margin: 0, fontSize: 11, color: '#b91c1c', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', paddingRight: 70, fontWeight: 600 }}>{ep.curl}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const fetchKeys = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getApiKeys();
      setKeys(res.data.apiKeys || []);
    } catch {
      setError('Failed to load API keys. Make sure the server is running.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleDelete = (id) => setKeys(prev => prev.filter(k => k._id !== id));
  const handleToggle = (id, isActive) => setKeys(prev => prev.map(k => k._id === id ? { ...k, isActive } : k));

  return (
    <>
      <style>{`
        .apk-root * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }

        /* Scoped Dark Mode Support */
        .admin-dark .apk-root { background: transparent !important; }
        .admin-dark .apk-card-bg { background: #181818 !important; border-color: #2a2a2a !important; color: #fff !important; }
        .admin-dark .apk-text-title { color: #fff !important; }
        .admin-dark .apk-text-sub { color: #aaa !important; }
      `}</style>

      <div className="apk-root" style={{ minHeight: '100vh', background: 'transparent', padding: '16px 8px', maxWidth: 1180, margin: '0 auto' }}>
        {showCreate && (
          <CreateKeyModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); fetchKeys(); }}
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#fff1f1', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(255,0,0,0.12)'
            }}>
              <Key size={24} color="#ff0000" />
            </div>
            <div>
              <h1 className="apk-text-title" style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>API Keys</h1>
              <p className="apk-text-sub" style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>Connect external applications to share data securely</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchKeys} style={{
              padding: '10px 16px', background: '#ffffff', border: '1px solid #cbd5e1',
              borderRadius: 12, color: '#475569', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setShowCreate(true)} style={{
              padding: '10px 20px', background: '#ff0000',
              border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 900,
              boxShadow: '0 4px 16px rgba(255,0,0,0.3)'
            }}>
              <Plus size={16} /> New API Key
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Keys', value: keys.length, color: '#0f172a', icon: <Key size={16} color="#ff0000" /> },
            { label: 'Active', value: keys.filter(k => k.isActive && !(k.expiresAt && new Date() > new Date(k.expiresAt))).length, color: '#16a34a', icon: <CheckCircle2 size={16} color="#16a34a" /> },
            { label: 'Inactive', value: keys.filter(k => !k.isActive).length, color: '#64748b', icon: <Lock size={16} color="#64748b" /> },
            { label: 'Expired', value: keys.filter(k => k.expiresAt && new Date() > new Date(k.expiresAt)).length, color: '#dc2626', icon: <XCircle size={16} color="#dc2626" /> },
          ].map(s => (
            <div key={s.label} className="apk-card-bg" style={{
              flex: '1 1 140px', background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: 700 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 20, alignItems: 'start' }}>
          {/* Keys list */}
          <div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#dc2626" />
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 700 }}>{error}</span>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => (
                  <div key={i} className="apk-card-bg" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, height: 110 }} />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="apk-card-bg" style={{
                background: '#ffffff', border: '2px dashed #cbd5e1',
                borderRadius: 20, padding: '56px 24px', textAlign: 'center'
              }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff1f1', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Key size={28} color="#ff0000" />
                </div>
                <h3 className="apk-text-title" style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 900, color: '#0f172a' }}>No API Keys Yet</h3>
                <p className="apk-text-sub" style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', fontWeight: 500 }}>Create your first API key to connect external applications.</p>
                <button onClick={() => setShowCreate(true)} style={{
                  padding: '12px 24px', background: '#ff0000',
                  border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 14,
                  boxShadow: '0 4px 16px rgba(255,0,0,0.3)'
                }}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Create First Key
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {keys.map(k => (
                  <KeyCard key={k._id} keyData={k} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
            <DocsPanel />
          </div>
        </div>
      </div>
    </>
  );
}
