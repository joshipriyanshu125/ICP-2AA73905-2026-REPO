import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Tag, Folder, Loader2 } from 'lucide-react';

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
  { value: 'high', label: 'High', color: '#F97316' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#10B981' }
];

const DEFAULT_CATEGORIES = ['Design', 'Planning', 'Engineering', 'Marketing', 'Meetings', 'Operations'];

export function TaskModal({ task, isOpen, onClose, onSave, workspaces, currentWorkspace }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Design');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setCategory(task.category || 'Design');
      setStatus(task.status || 'todo');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setWorkspaceId(task.workspaceId || currentWorkspace?._id || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Design');
      setStatus('todo');
      setDueDate('');
      setWorkspaceId(currentWorkspace?._id || '');
    }
  }, [task, isOpen, currentWorkspace]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const finalCategory = customCategory.trim() || category;
    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category: finalCategory,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      workspaceId: workspaceId || undefined
    };

    try {
      await onSave(taskPayload, task?._id);
      onClose();
    } catch (err) {
      console.error('Save task error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.4rem', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Review brand design mockups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add key context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid: Priority & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Grid: Category & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : task ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
