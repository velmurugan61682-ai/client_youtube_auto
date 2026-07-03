import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or initialize the singleton Socket.IO client instance.
 */
export const getSocket = () => {
  if (!socket) {
    const rawUrl = import.meta.env.VITE_API_URL || '';
    // Strip trailing endpoints to get the root server URL
    const socketUrl = rawUrl
      .replace(/\/api\/?$/, '')
      .replace(/\/auth\/google\/?$/, '') || 'http://localhost:5000';

    console.log(`🔌 [Socket.IO] Initializing singleton instance for URL: ${socketUrl}`);

    socket = io(socketUrl, {
      transports: ['polling', 'websocket'], // Robust default: start with polling, upgrade to WS
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      autoConnect: false, // Wait for explicit connection call with token
    });

    // Global connection lifecycle logging
    socket.on('connect', () => {
      const transportName = socket.io.engine.transport.name;
      console.log(`✅ [Socket.IO] Connected successfully. Socket ID: ${socket.id}. Active Transport: ${transportName}`);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [Socket.IO] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Disconnected. Reason: ${reason}`);
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

    // Low-level packets debugging
    socket.io.on('ping', () => {
      console.log('⚡ [Socket.IO] Ping sent to server');
    });
  }
  return socket;
};

/**
 * Connect the socket instance, ensuring the authentication token is attached.
 * @param {string} [token] Optional authorization token (falls back to localStorage)
 */
export const connectSocket = (token) => {
  const s = getSocket();
  const actualToken = token || localStorage.getItem('token');

  if (actualToken && actualToken !== 'null' && actualToken !== 'undefined') {
    s.auth = { token: actualToken };
  } else {
    console.warn('⚠️ [Socket.IO] Connecting without a token. Server-side validation may fail.');
    s.auth = {};
  }

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
  if (socket) {
    console.log('🔌 [Socket.IO] Disconnecting socket...');
    socket.disconnect();
  }
};
