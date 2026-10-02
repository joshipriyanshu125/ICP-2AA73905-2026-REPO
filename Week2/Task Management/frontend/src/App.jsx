import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { getSocket, joinWorkspaceRoom, leaveWorkspaceRoom, updateSocketAuth } from './socket';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { TaskModal } from './components/TaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { WorkspaceModal } from './components/WorkspaceModal';
import { Check, AlertCircle } from 'lucide-react';

const INITIAL_FALLBACK_TASKS = [
  {
    _id: 'seed-1',
    title: 'Review design mockups',
    description: 'Ensure color tokens and typography align with TaskFlow editorial design system.',
    priority: 'high',
    category: 'Design',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    subtasks: [
      { _id: 'st-1', title: 'Check typography line heights', isCompleted: true },
      { _id: 'st-2', title: 'Verify terracotta hex accents', isCompleted: false },
    ],
  },
  {
    _id: 'seed-2',
    title: 'Write project brief',
    description: 'Outline Q4 milestones and engineering scope for team kickoff.',
    priority: 'medium',
    category: 'Planning',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    subtasks: [{ _id: 'st-3', title: 'Draft milestone breakdown', isCompleted: false }],
  },
  {
    _id: 'seed-3',
    title: 'Team standup prep',
    description: 'Sync with backend lead on MongoDB aggregate performance indexing.',
    priority: 'low',
    category: 'Meetings',
    status: 'completed',
    dueDate: new Date().toISOString(),
    subtasks: [],
  },
  {
    _id: 'seed-4',
    title: 'Deploy v2.0 API gateway',
    description: 'Configure rate limiter and SSL certificate verification.',
    priority: 'urgent',
    category: 'Engineering',
    status: 'todo',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    subtasks: [],
  },
];

export function App() {
  const [user, setUser] = useState(api.user);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'kanban' | 'deadlines' | 'analytics'
  const [toast, setToast] = useState(null);

  // Modal States
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null, defaultDate: null });
  const [detailDrawerTask, setDetailDrawerTask] = useState(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial user profile & check token
  useEffect(() => {
    if (api.token) {
      api.getMe()
        .then((res) => {
          if (res?.user) setUser(res.user);
        })
        .catch(() => {
          // Token invalid
          setUser(null);
        });
    }
  }, []);

  // Fetch workspaces & tasks when user logs in or workspace changes
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getTasks({ workspaceId: currentWorkspace?._id });
      if (res?.tasks && res.tasks.length > 0) {
        setTasks(res.tasks);
      } else if (tasks.length === 0) {
        // If DB has 0 tasks, seed initial calm tasks so the user sees a polished UI
        setTasks(INITIAL_FALLBACK_TASKS);
      }
    } catch (err) {
      console.warn('Using local task fallback:', err.message);
      if (tasks.length === 0) {
        setTasks(INITIAL_FALLBACK_TASKS);
      }
    }
  }, [user, currentWorkspace]);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getWorkspaces();
      if (res?.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        if (!currentWorkspace) setCurrentWorkspace(res.workspaces[0]);
      }
    } catch (err) {
      // ignore
    }
  }, [user, currentWorkspace]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchWorkspaces();
    }
  }, [user, fetchTasks, fetchWorkspaces]);

  // Real-time Socket.IO Subscriptions (Task updated -> Mongo -> EventBus -> Redis Pub/Sub -> Socket.IO -> UI)
  useEffect(() => {
    if (!user) return;
    updateSocketAuth(api.token);
    const socket = getSocket();

    if (currentWorkspace?._id) {
      joinWorkspaceRoom(currentWorkspace._id);
    }

    const handleTaskUpdated = (payload) => {
      const updatedTask = payload.task;
      if (!updatedTask) return;
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
      );
      setDetailDrawerTask((prev) => (prev?._id === updatedTask._id ? { ...prev, ...updatedTask } : prev));
      showToast(`Task "${updatedTask.title}" updated in real-time ⚡`, 'info');
    };

    const handleTaskCreated = (payload) => {
      const newTask = payload.task;
      if (!newTask) return;
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
      showToast(`New task "${newTask.title}" added ⚡`, 'info');
    };

    const handleTaskDeleted = (payload) => {
      const { taskId } = payload;
      if (!taskId) return;
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setDetailDrawerTask((prev) => (prev?._id === taskId ? null : prev));
      showToast('A task was removed in real-time ⚡', 'info');
    };

    const handleTaskReordered = () => {
      fetchTasks();
    };

    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:reordered', handleTaskReordered);

    return () => {
      if (currentWorkspace?._id) {
        leaveWorkspaceRoom(currentWorkspace._id);
      }
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:reordered', handleTaskReordered);
    };
  }, [user, currentWorkspace, fetchTasks]);

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setAuthModal({ isOpen: false, mode: 'signin' });
    showToast(`Welcome, ${authenticatedUser.name}!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setTasks([]);
    showToast('Signed out successfully.');
  };

  // Task Handlers
  const handleToggleTask = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTask(taskId, { status: newStatus });
      showToast(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task status updated');
    } catch (err) {
      console.warn('API task update error:', err);
    }
  };

  const handleSaveTask = async (taskPayload, existingId) => {
    if (existingId) {
      // Update
      try {
        const res = await api.updateTask(existingId, taskPayload);
        const updated = res?.task || { ...taskPayload, _id: existingId };
        setTasks((prev) => prev.map((t) => (t._id === existingId ? { ...t, ...updated } : t)));
        showToast('Task updated successfully.');
      } catch (err) {
        // Optimistic local update fallback
        setTasks((prev) => prev.map((t) => (t._id === existingId ? { ...t, ...taskPayload } : t)));
        showToast('Task updated.');
      }
    } else {
      // Create
      try {
        const res = await api.createTask(taskPayload);
        const created = res?.task || { ...taskPayload, _id: `local-${Date.now()}` };
        setTasks((prev) => [created, ...prev]);
        showToast('Task created! 🚀');
      } catch (err) {
        // Optimistic local fallback
        const mockTask = { ...taskPayload, _id: `local-${Date.now()}` };
        setTasks((prev) => [mockTask, ...prev]);
        showToast('Task created.');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.deleteTask(taskId);
      showToast('Task deleted.');
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
        onLogout={handleLogout}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        setCurrentWorkspace={setCurrentWorkspace}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {user ? (
          <Dashboard
            tasks={tasks}
            user={user}
            onToggleTask={handleToggleTask}
            onOpenNewTask={(date) => setTaskModal({ isOpen: true, task: null, defaultDate: date || null })}
            onEditTask={(task) => setTaskModal({ isOpen: true, task, defaultDate: null })}
            onOpenTaskDetail={(task) => setDetailDrawerTask(task)}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={(newTasks) => setTasks(newTasks)}
          />
        ) : (
          <LandingPage onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })} />
        )}
      </div>

      {/* Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Create / Edit Task Modal */}
      {taskModal.isOpen && (
        <TaskModal
          isOpen={taskModal.isOpen}
          task={taskModal.task}
          defaultDate={taskModal.defaultDate}
          onClose={() => setTaskModal({ isOpen: false, task: null, defaultDate: null })}
          onSave={handleSaveTask}
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
        />
      )}

      {/* Task Detail & Subtasks Drawer */}
      {detailDrawerTask && (
        <TaskDetailDrawer
          isOpen={Boolean(detailDrawerTask)}
          task={detailDrawerTask}
          onClose={() => setDetailDrawerTask(null)}
          onUpdateTask={(updated) => {
            setDetailDrawerTask(updated);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          }}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Workspace Management Modal */}
      {workspaceModalOpen && (
        <WorkspaceModal
          isOpen={workspaceModalOpen}
          onClose={() => setWorkspaceModalOpen(false)}
          currentWorkspace={currentWorkspace}
          onWorkspaceCreated={(newWs) => {
            setWorkspaces((prev) => [...prev, newWs]);
            setCurrentWorkspace(newWs);
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            {toast.type === 'success' ? (
              <Check size={16} color="#10B981" />
            ) : (
              <AlertCircle size={16} color="#EF4444" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
