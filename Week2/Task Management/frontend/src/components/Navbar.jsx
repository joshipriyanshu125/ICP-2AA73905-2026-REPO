import React, { useState } from 'react';
import { CheckSquare, LogOut, User, FolderKanban, Plus, UserPlus, Shield, Users } from 'lucide-react';

export function Navbar({ 
  user, 
  onOpenAuth, 
  onOpenWorkspaceModal, 
  onLogout, 
  workspaces = [], 
  currentWorkspace, 
  setCurrentWorkspace,
  currentView = 'dashboard',
  onNavigate
}) {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="header-nav">
      <div className="nav-container">
        {/* Brand Logo & Workspace Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a 
            href="#" 
            className="brand-logo" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('dashboard');
            }}
          >
            <div className="brand-icon-box">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span>TaskFlow</span>
          </a>

          {/* Workspace Switcher & Invite Controls */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  fontSize: '0.825rem', 
                  padding: '0.3rem 0.75rem',
                  borderRadius: '100px',
                  backgroundColor: '#F7F4EE',
                  borderColor: 'rgba(87, 83, 78, 0.15)'
                }}
              >
                <FolderKanban size={14} color="#C25508" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentWorkspace?.name || 'Personal Space'}
                </span>
              </button>

              {showWorkspaceMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '125%',
                    left: 0,
                    width: '230px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(87, 83, 78, 0.15)',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-card-hover)',
                    padding: '0.5rem',
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Workspaces
                  </div>

                  {workspaces && workspaces.length > 0 ? (
                    workspaces.map((w) => (
                      <button
                        key={w._id || w.id}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                          fontSize: '0.825rem',
                          backgroundColor: currentWorkspace?._id === w._id ? 'var(--accent-terracotta-light)' : 'transparent',
                          color: currentWorkspace?._id === w._id ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                          borderRadius: '8px',
                          marginBottom: '2px',
                          fontWeight: currentWorkspace?._id === w._id ? 700 : 500
                        }}
                        onClick={() => {
                          setCurrentWorkspace(w);
                          setShowWorkspaceMenu(false);
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {w.name}
                        </span>
                        {currentWorkspace?._id === w._id && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-terracotta)', fontWeight: 700 }}>✓</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      No workspace created yet.
                    </div>
                  )}

                  <div style={{ height: '1px', background: 'rgba(87, 83, 78, 0.1)', margin: '0.4rem 0' }} />

                  {/* Invite Teammates button */}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#047857', fontSize: '0.8rem', borderRadius: '8px' }}
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onOpenWorkspaceModal?.('invite');
                    }}
                  >
                    <UserPlus size={13} style={{ marginRight: '6px' }} /> Invite Teammates
                  </button>

                  {/* Create Workspace button */}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-terracotta)', fontSize: '0.8rem', borderRadius: '8px' }}
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onOpenWorkspaceModal?.('create');
                    }}
                  >
                    <Plus size={13} style={{ marginRight: '6px' }} /> New Workspace
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
              {/* Navigation Links (Dashboard & Admin Panel) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate?.('dashboard')}
                  style={{
                    background: currentView === 'dashboard' ? '#F1ECE4' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: currentView === 'dashboard' ? 700 : 500,
                    color: currentView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '100px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Dashboard
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.('admin')}
                    style={{
                      background: currentView === 'admin' ? '#FEE2E2' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: currentView === 'admin' ? 700 : 600,
                      color: currentView === 'admin' ? '#991B1B' : '#B91C1C',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Shield size={14} />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Team Link */}
                <button
                  type="button"
                  onClick={() => onNavigate?.('team')}
                  style={{
                    background: currentView === 'team' ? '#FDF3EB' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: currentView === 'team' ? 700 : 500,
                    color: currentView === 'team' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Users size={14} />
                  <span>Team</span>
                </button>
              </div>

              {/* User Pill */}
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
                {isAdmin ? (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
                      padding: '2px 7px',
                      borderRadius: '100px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Admin
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: '#EAE6DF',
                      color: 'var(--text-secondary)',
                      padding: '2px 7px',
                      borderRadius: '100px',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  >
                    {user?.role || 'user'}
                  </span>
                )}
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
