import React, { useState } from 'react';
import { 
  CheckCircle, 
  Filter, 
  Calendar, 
  GripVertical, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap, 
  Layers 
} from 'lucide-react';

export function LandingPage({ onOpenAuth }) {
  // Interactive preview items on landing page
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Review design mockups', priority: 'high', category: 'Design', completed: false },
    { id: 2, title: 'Write project brief', priority: 'medium', category: 'Planning', completed: false },
    { id: 3, title: 'Team standup prep', priority: 'low', category: 'Meetings', completed: true },
    { id: 4, title: 'Deploy v2.0 API gateway', priority: 'urgent', category: 'Engineering', completed: false }
  ]);

  const toggleDemoTask = (id) => {
    setDemoTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <main>
      {/* 1. Hero Section */}
      <section className="hero-section">
        {/* Pill Badge */}
        <div className="badge-pill" style={{ marginBottom: '1.25rem' }}>
          <Sparkles size={14} color="#C25508" />
          <span>Free for individuals. Ready for teams.</span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title">
          Organize your work, <span className="hero-highlight">beautifully.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          TaskFlow is a calm, focused task manager that helps individuals and teams
          stay on top of deadlines, priorities, and progress — without the clutter.
        </p>

        {/* Hero Actions */}
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth('signup')}>
            <span>Get started free</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => onOpenAuth('signin')}>
            <span>Sign in</span>
          </button>
        </div>
      </section>

      {/* 2. Everything You Need - 4 Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything you need</h2>
          <p className="section-subtitle">A complete toolkit for managing tasks your way.</p>
        </div>

        <div className="features-grid">
          {/* Feature 1: CRUD Tasks */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#FDF2E9', color: '#C25508' }}>
              <CheckCircle size={22} strokeWidth={2.2} />
            </div>
            <h3 className="feature-card-title">CRUD tasks</h3>
            <p className="feature-card-desc">
              Create, read, update, and delete tasks with a clean, fast interface.
            </p>
          </div>

          {/* Feature 2: Smart Filtering */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <Filter size={22} strokeWidth={2.2} />
            </div>
            <h3 className="feature-card-title">Smart filtering</h3>
            <p className="feature-card-desc">
              Filter by status, priority, category, due date, and keyword search.
            </p>
          </div>

          {/* Feature 3: Deadlines */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Calendar size={22} strokeWidth={2.2} />
            </div>
            <h3 className="feature-card-title">Deadlines</h3>
            <p className="feature-card-desc">
              Set due dates and spot urgent work with warm, color-coded cues.
            </p>
          </div>

          {/* Feature 4: Drag & drop */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
              <GripVertical size={22} strokeWidth={2.2} />
            </div>
            <h3 className="feature-card-title">Drag & drop</h3>
            <p className="feature-card-desc">
              Reorder tasks instantly to match your priorities and workflow.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Built for Focus Showcase Section */}
      <section className="focus-section">
        <div className="focus-card">
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Built for focus.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.75rem' }}>
              No noisy notifications. No overwhelming boards. Just you, your team, and the work that matters — stored safely in the cloud and ready anywhere.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--accent-terracotta-light)', color: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>Keyboard-friendly navigation & fast shortcuts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--accent-terracotta-light)', color: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>Instant cloud synchronization with MongoDB backend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--accent-terracotta-light)', color: 'var(--accent-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>Workspace isolation & collaborative team sharing</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Demo Preview Box */}
          <div className="task-preview-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Interactive Preview
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                Click to try ⚡
              </span>
            </div>

            {demoTasks.map(task => (
              <div 
                key={task.id} 
                className={`task-preview-item ${task.completed ? 'task-card-completed' : ''}`}
                onClick={() => toggleDemoTask(task.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="task-preview-left">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={task.completed}
                    onChange={() => toggleDemoTask(task.id)}
                  />
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {task.title}
                  </span>
                </div>

                <div className="task-preview-tags">
                  <span className={`tag-priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  <span className={`tag-category tag-cat-${task.category}`}>
                    {task.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
