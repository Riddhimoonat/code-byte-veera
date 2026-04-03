import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/services/socket.service.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io to it
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
