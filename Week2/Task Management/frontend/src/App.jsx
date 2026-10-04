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
import { AdminPanel } from './components/AdminPanel';
import { TeamModal } from './components/TeamModal';
import { TeamBoardView } from './components/TeamBoardView';
import { Check, AlertCircle, Users } from 'lucide-react';

const INITIAL_FALLBACK_TASKS = [];

export function App() {
  const [user, setUser] = useState(api.user);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [mainNavView, setMainNavView] = useState(() => {
    const saved = localStorage.getItem('taskflow_mainNavView');
    return saved === 'admin' ? 'admin' : 'dashboard';
  }); // 'dashboard' | 'admin' | 'team'
  const [toast, setToast] = useState(null);

  // Modal States
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null, defaultDate: null });
  const [detailDrawerTask, setDetailDrawerTask] = useState(null);
  const [workspaceModalState, setWorkspaceModalState] = useState({ isOpen: false, tab: 'create' });
  const [teamModalState, setTeamModalState] = useState({ isOpen: false, tab: 'list' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // On mount: check URL for password-reset token and auto-open the reset modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('token');
    if (resetToken && !api.token) {
      setAuthModal({ isOpen: true, mode: 'reset' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskflow_mainNavView', mainNavView);
  }, [mainNavView]);

  // Fetch initial user profile & check token
  useEffect(() => {
    if (api.token) {
      api.getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            if (res.user.role === 'admin') {
              setMainNavView('admin');
              localStorage.setItem('taskflow_mainNavView', 'admin');
            } else {
              const saved = localStorage.getItem('taskflow_mainNavView');
              if (saved === 'admin') {
                setMainNavView('admin');
              }
            }
          }
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
      setTasks(res?.tasks || []);
    } catch (err) {
      console.warn('Fetch tasks error:', err.message);
      setTasks([]);
    }
  }, [user, currentWorkspace]);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getWorkspaces();
      if (Array.isArray(res?.workspaces)) {
        const savedWorkspaceId = localStorage.getItem(`taskflow_workspace_${user._id}`);
        setWorkspaces((previous) => {
          const workspacesById = new Map(previous.map((workspace) => [workspace._id, workspace]));
          res.workspaces.forEach((workspace) => workspacesById.set(workspace._id, workspace));
          return Array.from(workspacesById.values());
        });
        setCurrentWorkspace((current) =>
          current || res.workspaces.find((workspace) => workspace._id === savedWorkspaceId) || res.workspaces[0] || null
        );
      }
    } catch (err) {
      console.warn('Fetch workspaces error:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id && currentWorkspace?._id) {
      localStorage.setItem(`taskflow_workspace_${user._id}`, currentWorkspace._id);
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
    if (authenticatedUser.role === 'admin') {
      setMainNavView('admin');
      localStorage.setItem('taskflow_mainNavView', 'admin');
    } else {
      const saved = localStorage.getItem('taskflow_mainNavView');
      if (saved === 'admin') {
        setMainNavView('admin');
      }
    }
    showToast(`Welcome, ${authenticatedUser.name}!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setTasks([]);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setMainNavView('dashboard');
    localStorage.removeItem('taskflow_mainNavView');
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
      try {
        const res = await api.updateTask(existingId, taskPayload);
        const updated = res?.task || taskPayload;
        setTasks((prev) => prev.map((t) => (t._id === existingId ? { ...t, ...updated } : t)));
        showToast('Task updated successfully.');
      } catch (err) {
        console.warn('Task update error:', err);
        showToast('Failed to save task changes.', 'error');
      }
    } else {
      try {
        const res = await api.createTask(taskPayload);
        const created = res?.task || taskPayload;
        setTasks((prev) => [created, ...prev]);
        showToast('Task created! 🚀');
      } catch (err) {
        console.warn('Task create error:', err);
        showToast('Failed to create task.', 'error');
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
        onOpenWorkspaceModal={(tab = 'create') => setWorkspaceModalState({ isOpen: true, tab })}
        onLogout={handleLogout}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        setCurrentWorkspace={setCurrentWorkspace}
        currentView={mainNavView}
        onNavigate={setMainNavView}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {user ? (
          mainNavView === 'admin' && user?.role === 'admin' ? (
            <AdminPanel currentUser={user} onShowToast={showToast} />
          ) : mainNavView === 'team' ? (
            <TeamBoardView
              currentWorkspace={currentWorkspace}
              user={user}
              onOpenTeamModal={() => setTeamModalState({ isOpen: true, tab: 'list' })}
            />
          ) : (
            <Dashboard
              tasks={tasks}
              user={user}
              currentWorkspace={currentWorkspace}
              onOpenWorkspaceModal={(tab = 'invite') => setWorkspaceModalState({ isOpen: true, tab })}
              onToggleTask={handleToggleTask}
              onOpenNewTask={(date) => setTaskModal({ isOpen: true, task: null, defaultDate: date || null })}
              onEditTask={(task) => setTaskModal({ isOpen: true, task, defaultDate: null })}
              onOpenTaskDetail={(task) => setDetailDrawerTask(task)}
              onDeleteTask={handleDeleteTask}
              onReorderTasks={(newTasks) => setTasks(newTasks)}
            />
          )
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
      {workspaceModalState.isOpen && (
        <WorkspaceModal
          isOpen={workspaceModalState.isOpen}
          initialTab={workspaceModalState.tab}
          onClose={() => setWorkspaceModalState({ isOpen: false, tab: 'create' })}
          currentWorkspace={currentWorkspace}
          onWorkspaceCreated={(newWs) => {
            setWorkspaces((prev) => [...prev.filter((workspace) => workspace._id !== newWs._id), newWs]);
            setCurrentWorkspace(newWs);
            if (user?._id) {
              localStorage.setItem(`taskflow_workspace_${user._id}`, newWs._id);
            }
            setMainNavView('dashboard');
            showToast('Workspace created successfully!');
          }}
        />
      )}

      {/* Team Management Modal */}
      {teamModalState.isOpen && (
        <TeamModal
          isOpen={teamModalState.isOpen}
          onClose={() => setTeamModalState({ isOpen: false, tab: 'list' })}
          currentWorkspace={currentWorkspace}
          onShowToast={showToast}
          onTeamCreated={(team) => {
            setTeamModalState({ isOpen: false, tab: 'list' });
            showToast('Team created successfully!');
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
