import { io } from 'socket.io-client';
import { api } from './api';

let socket = null;

export function getSocket() {
  if (!socket) {
    const socketUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin;

    socket = io(socketUrl, {
      auth: {
        token: api.token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ Real-time Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Real-time Socket connection warning:', err.message);
    });
  }

  return socket;
}

export function updateSocketAuth(token) {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
}

export function joinProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId) {
    s.emit('join:project', projectId);
  }
}

export function leaveProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId) {
    s.emit('leave:project', projectId);
  }
}

export function joinWorkspaceRoom(workspaceId) {
  const s = getSocket();
  if (s && workspaceId) {
    s.emit('join:workspace', workspaceId);
  }
}

export function leaveWorkspaceRoom(workspaceId) {
  const s = getSocket();
  if (s && workspaceId) {
    s.emit('leave:workspace', workspaceId);
  }
}
