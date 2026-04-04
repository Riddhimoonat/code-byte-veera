import { Server } from 'socket.io';

let io = null;

/**
 * Initialise Socket.io on the given HTTP server.
 * Call this once from server.js after creating the http server.
 * @param {import('http').Server} server
 * @returns {import('socket.io').Server}
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Allow users to join their own room for directed alerts
    socket.on('join', (userId) => {
      socket.join(userId.toString());
      console.log(`[Socket.io] User ${userId} joined their personal room.`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.io] Initialised');
  return io;
};

/**
 * Emit a new SOS event to all connected dashboard clients.
 * @param {Object} data - SOSEvent document (or plain object)
 */
const emitSOSNew = (data) => {
  if (!io) {
    console.warn('[Socket.io] emitSOSNew called before initSocket');
    return;
  }
  io.emit('sos:new', data);
};

/**
 * Emit an SOS status update to all connected dashboard clients.
 * @param {Object} data - updated SOSEvent document (or plain object)
 */
const emitSOSUpdated = (data) => {
  if (!io) {
    console.warn('[Socket.io] emitSOSUpdated called before initSocket');
    return;
  }
  io.emit('sos:updated', data);
};

/**
 * Emit a nearby SOS alert to a specific volunteer user.
 * @param {string} userId 
 * @param {Object} data 
 */
const emitSOSVolunteer = (userId, data) => {
  if (!io) return;
  // Send specifically to the user's room
  io.to(userId).emit('sos:volunteer_nearby', data);
};

export { initSocket, emitSOSNew, emitSOSUpdated, emitSOSVolunteer };
