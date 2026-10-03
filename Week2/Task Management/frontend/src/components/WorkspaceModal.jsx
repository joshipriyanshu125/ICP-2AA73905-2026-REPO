import React, { useState } from 'react';
import { X, FolderPlus, UserPlus, Loader2, Check } from 'lucide-react';
import { api } from '../api';

export function WorkspaceModal({ isOpen, onClose, onWorkspaceCreated, currentWorkspace, initialTab = 'create' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'create' | 'invite'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.createWorkspace(name.trim(), description.trim());
      if (res?.workspace) {
        onWorkspaceCreated(res.workspace);
        setSuccessMsg('Workspace created successfully!');
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentWorkspace?._id) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.inviteMember(currentWorkspace._id, inviteEmail.trim(), inviteRole);
      setSuccessMsg(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to invite user. Ensure user email exists in the system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.4rem', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(87, 83, 78, 0.12)', marginBottom: '1.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{
              borderBottom: activeTab === 'create' ? '2px solid var(--accent-terracotta)' : '2px solid transparent',
              borderRadius: 0,
              padding: '0.5rem 0.2rem',
              fontWeight: activeTab === 'create' ? 700 : 500,
              color: activeTab === 'create' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
            }}
            onClick={() => setActiveTab('create')}
          >
            <FolderPlus size={16} /> New Workspace
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{
              borderBottom: activeTab === 'invite' ? '2px solid var(--accent-terracotta)' : '2px solid transparent',
              borderRadius: 0,
              padding: '0.5rem 0.2rem',
              fontWeight: activeTab === 'invite' ? 700 : 500,
              color: activeTab === 'invite' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
            }}
            onClick={() => setActiveTab('invite')}
          >
            <UserPlus size={16} /> Invite Members
          </button>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              color: '#991B1B',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Create Workspace */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateWorkspace}>
            <div className="form-group">
              <label className="form-label">Workspace Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Design Studio, Engineering Squad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Invite Member */}
        {activeTab === 'invite' && (
          <form onSubmit={handleInviteMember}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Invite a teammate to <strong>{currentWorkspace?.name || 'this workspace'}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">Teammate Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="colleague@taskflow.dev"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Role</label>
              <select className="form-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member (Can edit tasks)</option>
                <option value="admin">Admin (Can manage settings)</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
