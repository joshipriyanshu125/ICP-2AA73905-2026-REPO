import React, { useState } from 'react';
import { CheckSquare, LogOut, User, FolderKanban, Plus } from 'lucide-react';

export function Navbar({ 
  user, 
  onOpenAuth, 
  onOpenWorkspaceModal, 
  onLogout, 
  workspaces, 
  currentWorkspace, 
  setCurrentWorkspace 
}) {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="header-nav">
      <div className="nav-container">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="#" className="brand-logo" onClick={(e) => e.preventDefault()}>
            <div className="brand-icon-box">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span>TaskFlow</span>
          </a>

          {/* Workspace Switcher (If multiple workspaces) */}
          {user && workspaces && workspaces.length > 1 && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
              >
                <FolderKanban size={13} color="#C25508" />
                <span>{currentWorkspace?.name || 'Workspace'}</span>
              </button>

              {showWorkspaceMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    width: '200px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(87, 83, 78, 0.15)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-card-hover)',
                    padding: '0.4rem',
                    zIndex: 50,
                  }}
                >
                  {workspaces.map((w) => (
                    <button
                      key={w._id || w.id}
                      className="btn btn-ghost btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        fontSize: '0.825rem',
                        backgroundColor: currentWorkspace?._id === w._id ? 'var(--accent-terracotta-light)' : 'transparent',
                        color: currentWorkspace?._id === w._id ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                      }}
                      onClick={() => {
                        setCurrentWorkspace(w);
                        setShowWorkspaceMenu(false);
                      }}
                    >
                      {w.name}
                    </button>
                  ))}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-terracotta)', fontSize: '0.8rem' }}
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onOpenWorkspaceModal();
                    }}
                  >
                    <Plus size={13} /> + New Workspace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user ? (
            <>
              {/* Dashboard Link */}
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </span>

              {/* User Pill (Matching Screenshot 1) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '100px',
                  backgroundColor: '#F1ECE4',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#E4DDD2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <User size={13} />
                </div>
                <span>{displayName}</span>
              </div>

              {/* Logout Icon Button */}
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  borderRadius: '8px'
                }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => onOpenAuth('signin')}>
                Sign in
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onOpenAuth('signup')}
                style={{
                  backgroundColor: '#C25508',
                  borderRadius: '100px',
                  padding: '0.55rem 1.25rem',
                  fontWeight: 600
                }}
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
