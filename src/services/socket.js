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
      transports: ['websocket', 'polling'], // Direct WebSocket first, seamless fallback to polling
      upgrade: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
      timeout: 20000,
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

    // Handle automatic reconnection after network restoration & bfcache restoration
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token && token !== 'null' && token !== 'undefined' && socket && !socket.connected) {
          console.log('✓ Network Connected (Restored). Reconnecting socket...');
          socket.connect();
        }
      });

      // Handle Back-Forward Cache (bfcache) & page hiding to prevent WebSocket crashes
      window.addEventListener('pagehide', () => {
        if (socket && (socket.connected || socket.active)) {
          console.log('⏸️ [Socket.IO] Page entering Back-Forward Cache. Gracefully disconnecting socket...');
          socket.disconnect();
        }
      });

      window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          console.log('▶️ [Socket.IO] Page restored from Back-Forward Cache. Reconnecting socket...');
          const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
          if (token && token !== 'null' && token !== 'undefined' && socket && !socket.connected) {
            socket.connect();
          }
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

  if (actualToken && actualToken !== 'null' && actualToken !== 'undefined') {
    s.auth = { token: actualToken };
  } else {
    s.auth = {};
  }

  if (!s.connected && !s.active) {
    console.log('🔌 [Socket.IO] Connecting socket...');
    s.connect();
  } else {
    console.log('🔌 [Socket.IO] Socket is already active or connected.');
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

