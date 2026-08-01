import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/environment.js';

let socket = null;

/**
 * Get or initialize the singleton Socket.IO client instance.
 */
export const getSocket = () => {
  if (!socket) {
    console.log(`✓ Socket URL: ${SOCKET_URL}`);

    socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      transports: ['polling', 'websocket'], // Start with HTTP polling to establish connection, then upgrade to WebSocket.
      reconnectionAttempts: Infinity, // Reconnect automatically
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
      auth: (cb) => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        cb({ token: (token && token !== 'null' && token !== 'undefined') ? token : '' });
      }
    });

    // Global connection lifecycle logging
    socket.on('connect', () => {
      const transportName = socket.io.engine.transport.name;
      console.log(`✅ [Socket.IO] Connected successfully. Socket ID: ${socket.id}. Active Transport: ${transportName}`);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [Socket.IO] Connection error:', error.message);
      if (error.message === 'Authentication error') {
        console.warn('⚠️ [Socket.IO] Auth rejected by server. Disconnecting socket.');
        socket.disconnect();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Disconnected. Reason: ${reason}`);
      if (reason === 'io server disconnect') {
        // Disconnection was initiated by the server, attempt reconnect if token is available
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token && token !== 'null' && token !== 'undefined') {
          socket.connect();
        }
      }
    });

    // Transport upgrade tracking
    socket.io.on('open', () => {
      socket.io.engine.on('upgrade', (transport) => {
        console.log(`🚀 [Socket.IO] Transport upgraded to: ${transport.name}`);
      });
    });

    // Reconnection tracking
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`♻️ [Socket.IO] Reconnection attempt #${attempt}...`);
    });

    socket.io.on('reconnect', (attempt) => {
      console.log(`♻️ [Socket.IO] Reconnected successfully on attempt #${attempt}`);
    });

    socket.io.on('reconnect_error', (error) => {
      console.error('❌ [Socket.IO] Reconnection attempt error:', error.message);
    });

    socket.io.on('reconnect_failed', () => {
      console.error('❌ [Socket.IO] Reconnection failed completely after maximum attempts.');
    });

    // Handle automatic reconnection after network restoration
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token && token !== 'null' && token !== 'undefined' && socket && !socket.connected) {
          console.log('✓ Network Connected (Restored). Reconnecting socket...');
          socket.connect();
        }
      });
    }
  }
  return socket;
};

/**
 * Connect the socket instance, ensuring the authentication token is attached.
 * @param {string} [token] Optional authorization token (falls back to localStorage/adminToken)
 */
export const connectSocket = (token) => {
  const s = getSocket();
  const actualToken = token || localStorage.getItem('token') || localStorage.getItem('adminToken');

  if (!actualToken || actualToken === 'null' || actualToken === 'undefined') {
    console.warn('⚠️ [Socket.IO] No authentication token found. Skipping connection to prevent 400 Bad Request.');
    if (s.connected) {
      s.disconnect();
    }
    return s;
  }

  s.auth = { token: actualToken };

  if (!s.connected) {
    console.log('🔌 [Socket.IO] Connecting socket...');
    s.connect();
  } else {
    console.log('🔌 [Socket.IO] Socket is already connected.');
  }
  return s;
};

/**
 * Disconnect the socket.
 */
export const disconnectSocket = () => {
  if (socket && (socket.connected || socket.active)) {
    console.log('🔌 [Socket.IO] Disconnecting socket...');
    socket.disconnect();
  }
};

