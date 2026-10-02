import React, { useState } from 'react';
import { CheckSquare, Plus, Search, LogOut, User, Sparkles, FolderKanban, Bell, Shield } from 'lucide-react';

export function Navbar({ user, onOpenAuth, onOpenNewTask, onOpenWorkspaceModal, onLogout, currentView, setCurrentView, workspaces, currentWorkspace, setCurrentWorkspace }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  return (
    <header className="header-nav">
      <div className="nav-container">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); if (user) setCurrentView('list'); }}>
            <div className="brand-icon-box">
              <CheckSquare size={20} strokeWidth={2.5} />
            </div>
            <span>TaskFlow</span>
          </a>

          {/* Workspace Switcher (If logged in) */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}
              >
                <FolderKanban size={14} color="#C25508" />
                <span style={{ fontWeight: 600 }}>{currentWorkspace?.name || 'Personal Workspace'}</span>
              </button>

              {showWorkspaceMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    width: '240px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(87, 83, 78, 0.15)',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-card-hover)',
                    padding: '0.5rem',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Workspaces
                  </div>
                  {workspaces && workspaces.length > 0 ? (
                    workspaces.map((w) => (
                      <button
                        key={w._id || w.id}
                        className="btn btn-ghost"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '0.45rem 0.6rem',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
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
                    ))
                  ) : (
                    <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>Default Workspace</div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(87, 83, 78, 0.08)', margin: '0.4rem 0' }} />
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-terracotta)', fontWeight: 600 }}
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onOpenWorkspaceModal();
                    }}
                  >
                    <Plus size={14} /> + New Workspace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user ? (
            <>
              {/* View Switchers */}
              <div style={{ display: 'flex', background: '#F1ECE4', padding: '0.2rem', borderRadius: 'var(--radius-full)' }}>
                <button
                  className={`btn btn-sm ${currentView === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: 'none' }}
                  onClick={() => setCurrentView('list')}
                >
                  List
                </button>
                <button
                  className={`btn btn-sm ${currentView === 'kanban' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: 'none' }}
                  onClick={() => setCurrentView('kanban')}
                >
                  Board
                </button>
                <button
                  className={`btn btn-sm ${currentView === 'deadlines' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: 'none' }}
                  onClick={() => setCurrentView('deadlines')}
                >
                  Deadlines
                </button>
                <button
                  className={`btn btn-sm ${currentView === 'analytics' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: 'none' }}
                  onClick={() => setCurrentView('analytics')}
                >
                  Analytics
                </button>
              </div>

              {/* Create Task Button */}
              <button className="btn btn-primary btn-sm" onClick={onOpenNewTask}>
                <Plus size={16} /> New Task
              </button>

              {/* User Avatar Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  style={{
                    padding: '0.25rem',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    backgroundColor: '#E7E0D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--accent-terracotta)',
                    border: '1px solid rgba(87, 83, 78, 0.15)',
                  }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: '220px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(87, 83, 78, 0.15)',
                      borderRadius: '14px',
                      boxShadow: 'var(--shadow-card-hover)',
                      padding: '0.6rem',
                      zIndex: 50,
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.7rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(87, 83, 78, 0.08)', margin: '0.4rem 0' }} />
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: '#DC2626' }}
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => onOpenAuth('signin')}>
                Sign in
              </button>
              <button className="btn btn-primary" onClick={() => onOpenAuth('signup')}>
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
