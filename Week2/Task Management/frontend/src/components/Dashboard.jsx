import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ListOrdered, 
  GripVertical, 
  BarChart2, 
  CheckSquare, 
  AlertTriangle, 
  CheckCheck, 
  ArrowUpDown,
  Sparkles,
  Inbox
} from 'lucide-react';

export function Dashboard({ 
  tasks, 
  onToggleTask, 
  onOpenNewTask, 
  onEditTask, 
  onOpenTaskDetail, 
  onDeleteTask, 
  currentView, 
  onReorderTasks,
  user
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Filtered and searched tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        const matchCat = task.category?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && task.status === 'completed') return false;
        if (statusFilter === 'completed' && task.status !== 'completed') return false;
        if (['todo', 'in_progress', 'review'].includes(statusFilter) && task.status !== statusFilter) return false;
      }

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Category
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Unique categories in current task pool
  const availableCategories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [tasks]);

  // Drag and Drop reordering helpers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!id) return;

    if (targetStatus) {
      // Move between Kanban columns
      onToggleTask(id, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Helper for due date display
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isPast = date < now && !isToday;

    return {
      text: isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isPast,
      isToday,
    };
  };

  // Analytics Computation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const urgentCount = tasks.filter((t) => ['urgent', 'high'].includes(t.priority) && t.status !== 'completed').length;

    return { total, completed, pending, rate, urgentCount };
  }, [tasks]);

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem' }}>
            {stats.pending === 0 && stats.total > 0
              ? '✨ All tasks complete! Enjoy your serene day.'
              : `You have ${stats.pending} pending task${stats.pending === 1 ? '' : 's'} — let’s make steady progress.`}
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewTask}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filter Toolbar (Search & Filter Tags) */}
      <div className="toolbar-container">
        {/* Search */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks, categories, tags... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
            Status:
          </span>
          {['all', 'active', 'completed'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
            Priority:
          </span>
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`btn btn-sm ${priorityFilter === p ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setPriorityFilter(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {currentView === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const due = formatDueDate(task.dueDate);
              const subtasks = task.subtasks || [];
              const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;

              return (
                <div
                  key={task._id}
                  className={`task-preview-item ${isCompleted ? 'task-card-completed' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(87, 83, 78, 0.12)',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{ cursor: 'grab', color: '#A8A29E', display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={16} />
                    </div>

                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleTask(task._id, isCompleted ? 'todo' : 'completed')}
                    />

                    <div
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => onOpenTaskDetail(task)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </span>

                        {subtasks.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: '#F3EFEA', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                            ✓ {completedSubtasks}/{subtasks.length}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          style={{
                            fontSize: '0.825rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.2rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Tags & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {due && (
                      <span
                        style={{
                          fontSize: '0.775rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: due.isPast && !isCompleted ? '#DC2626' : due.isToday ? '#D97706' : 'var(--text-secondary)',
                          backgroundColor: due.isPast && !isCompleted ? '#FEE2E2' : '#FAF5EE',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Calendar size={12} /> {due.text}
                      </span>
                    )}

                    <span className={`tag-priority-${task.priority}`}>{task.priority}</span>
                    <span className={`tag-category tag-cat-${task.category}`}>{task.category}</span>

                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.3rem', color: 'var(--text-secondary)' }}
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.3rem', color: '#DC2626' }}
                      onClick={() => {
                        if (window.confirm('Delete this task?')) onDeleteTask(task._id);
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(87, 83, 78, 0.1)',
              }}
            >
              <Inbox size={40} color="#A8A29E" style={{ margin: '0 auto 1rem' }} />
              <h3 className="font-serif" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No tasks found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
                {searchQuery ? 'Try clearing your search query or filters.' : 'Get started by creating your very first task.'}
              </p>
              <button className="btn btn-primary btn-sm" onClick={onOpenNewTask}>
                <Plus size={15} /> Create Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {currentView === 'kanban' && (
        <div className="kanban-grid">
          {[
            { id: 'todo', title: 'To Do', color: '#6B7280' },
            { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
            { id: 'review', title: 'In Review', color: '#F59E0B' },
            { id: 'completed', title: 'Completed', color: '#10B981' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="column-header">
                  <div className="column-title">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                    <span>{col.title}</span>
                  </div>
                  <span className="column-count">{colTasks.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onClick={() => onOpenTaskDetail(task)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                          {task.title}
                        </span>
                        <span className={`tag-priority-${task.priority}`} style={{ fontSize: '0.7rem' }}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span className={`tag-category tag-cat-${task.category}`}>{task.category}</span>
                        {task.dueDate && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.825rem',
                        border: '1px dashed rgba(87, 83, 78, 0.2)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: DEADLINES VIEW */}
      {currentView === 'deadlines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            {
              title: '🚨 Overdue',
              filter: (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed',
              color: '#DC2626',
            },
            {
              title: '📅 Due Today',
              filter: (t) => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString(),
              color: '#D97706',
            },
            {
              title: '⏳ Upcoming Next 7 Days',
              filter: (t) => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                const now = new Date();
                const weekLater = new Date();
                weekLater.setDate(now.getDate() + 7);
                return d > now && d <= weekLater;
              },
              color: '#2563EB',
            },
            {
              title: '🌱 Later / No Due Date',
              filter: (t) => !t.dueDate || new Date(t.dueDate) > new Date(Date.now() + 7 * 24 * 3600 * 1000),
              color: '#4B5563',
            },
          ].map((group) => {
            const groupTasks = filteredTasks.filter(group.filter);

            return (
              <div key={group.title} className="card-clean" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', color: group.color, fontWeight: 600 }}>
                    {group.title}
                  </h3>
                  <span className="column-count">{groupTasks.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {groupTasks.map((task) => (
                    <div
                      key={task._id}
                      className="task-preview-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onOpenTaskDetail(task)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => onToggleTask(task._id, task.status === 'completed' ? 'todo' : 'completed')}
                        />
                        <span style={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {task.dueDate && (
                          <span style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`tag-priority-${task.priority}`}>{task.priority}</span>
                        <span className={`tag-category tag-cat-${task.category}`}>{task.category}</span>
                      </div>
                    </div>
                  ))}

                  {groupTasks.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                      No tasks in this timeframe.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 4: ANALYTICS & INSIGHTS */}
      {currentView === 'analytics' && (
        <div>
          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="card-clean">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Total Tasks
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {stats.total}
              </div>
            </div>

            <div className="card-clean">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Completion Rate
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-serif)' }}>
                {stats.rate}%
              </div>
            </div>

            <div className="card-clean">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Pending Tasks
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-terracotta)', fontFamily: 'var(--font-serif)' }}>
                {stats.pending}
              </div>
            </div>

            <div className="card-clean">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Urgent & High
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-serif)' }}>
                {stats.urgentCount}
              </div>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Priority Distribution */}
            <div className="card-clean">
              <h3 className="font-serif" style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Priority Distribution
              </h3>
              {['urgent', 'high', 'medium', 'low'].map((p) => {
                const count = tasks.filter((t) => t.priority === p).length;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={p} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p}</span>
                      <span>{count} tasks ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#F1EFEA', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor:
                            p === 'urgent'
                              ? '#EF4444'
                              : p === 'high'
                              ? '#F97316'
                              : p === 'medium'
                              ? '#F59E0B'
                              : '#10B981',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Breakdown */}
            <div className="card-clean">
              <h3 className="font-serif" style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Category Breakdown
              </h3>
              {availableCategories.filter((c) => c !== 'all').map((cat) => {
                const count = tasks.filter((t) => t.category === cat).length;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={cat} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <span>{count} tasks ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#F1EFEA', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: 'var(--accent-terracotta)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
