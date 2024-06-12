// public/script.js
const socket = io();

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const chatDiv = document.getElementById('chat');
const loginDiv = document.getElementById('login');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

let username = '';

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    socket.emit('set username', username);
    loginDiv.style.display = 'none';
    chatDiv.style.display = 'block';
  }
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(data) {
  const item = document.createElement('li');
  item.textContent = `${data.username}: ${data.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user joined', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user left', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});