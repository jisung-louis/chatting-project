const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];
let bannedUsers = [];
let mutedUsers = [];

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let username = '';

  console.log('A user connected');

  socket.on('set username', (name) => {
    if (bannedUsers.includes(name)) {
      socket.emit('ban', 'You are banned from this chat.');
      socket.disconnect();
      return;
    }
    username = name;
    users.push({ username, id: socket.id });
    io.emit('user joined', `${username} has joined the chat`);
    io.emit('update user list', users);
  });

  socket.on('chat message', (data) => {
    if (!mutedUsers.includes(data.username)) {
      io.emit('chat message', data);
    } else {
      socket.emit('muted', 'You are muted and cannot send messages.');
    }
  });

  socket.on('kick user', (user) => {
    const userToKick = users.find(u => u.username === user);
    if (userToKick) {
      io.to(userToKick.id).emit('kick', 'You have been kicked from the chat.');
      io.sockets.sockets.get(userToKick.id).disconnect();
      users = users.filter(u => u.username !== user);
      io.emit('update user list', users);
    }
  });

  socket.on('ban user', (user) => {
    const userToBan = users.find(u => u.username === user);
    if (userToBan) {
      bannedUsers.push(user);
      io.to(userToBan.id).emit('ban', 'You are banned from this chat.');
      io.sockets.sockets.get(userToBan.id).disconnect();
      users = users.filter(u => u.username !== user);
      io.emit('update user list', users);
    }
  });

  socket.on('mute user', (user) => {
    if (!mutedUsers.includes(user)) {
      mutedUsers.push(user);
      const userToMute = users.find(u => u.username === user);
      if (userToMute) {
        io.to(userToMute.id).emit('muted', 'You have been muted.');
      }
    }
  });

  socket.on('delete message', (msgId) => {
    io.emit('delete message', msgId);
  });

  socket.on('disconnect', () => {
    if (username) {
      users = users.filter(user => user.username !== username);
      io.emit('user left', `${username} has left the chat`);
      io.emit('update user list', users);
    }
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});