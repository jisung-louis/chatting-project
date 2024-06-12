// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let username = '';

  console.log('A user connected');

  socket.on('set username', (name) => {
    username = name;
    socket.broadcast.emit('user joined', `${username} has joined the chat`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { username, msg });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    socket.broadcast.emit('user left', `${username} has left the chat`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});