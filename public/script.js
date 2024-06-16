const socket = io();

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const chatDiv = document.getElementById('chat');
const loginDiv = document.getElementById('login');
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const userList = document.getElementById('user-list');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLoginModal = document.getElementById('admin-login-modal');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminUsernameInput = document.getElementById('admin-username');
const adminPasswordInput = document.getElementById('admin-password');
const modalClose = document.querySelector('.close');

let username = '';
let isAdmin = false;

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
    const msgId = `${username}-${Date.now()}`; // Unique ID for each message
    socket.emit('chat message', { username, msg: input.value, msgId });
    input.value = '';
  }
});

adminLoginBtn.addEventListener('click', function() {
  adminLoginModal.style.display = 'block';
});

modalClose.addEventListener('click', function() {
  adminLoginModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === adminLoginModal) {
    adminLoginModal.style.display = 'none';
  }
});

adminLoginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const adminUsername = adminUsernameInput.value.trim();
  const adminPassword = adminPasswordInput.value.trim();
  if (adminUsername === 'admin' && adminPassword === 'password') { // Replace with your own validation logic
    isAdmin = true;
    alert('Admin logged in successfully');
    adminLoginModal.style.display = 'none';
    updateUserListButtons();
  } else {
    alert('Invalid admin credentials');
  }
});

function updateAdminControls() {
  Array.from(userList.children).forEach(item => {
    const username = item.textContent;

    const kickButton = document.createElement('button');
    kickButton.textContent = 'Kick';
    kickButton.onclick = () => {
      socket.emit('kick user', username);
    };
    item.appendChild(kickButton);

    const muteButton = document.createElement('button');
    muteButton.textContent = 'Mute';
    muteButton.onclick = () => {
      socket.emit('mute user', username);
    };
    item.appendChild(muteButton);

    const banButton = document.createElement('button');
    banButton.textContent = 'Ban';
    banButton.onclick = () => {
      socket.emit('ban user', username);
    };
    item.appendChild(banButton);
  });
}

socket.on('chat message', function(data) {
  const item = document.createElement('li');
  item.id = data.msgId;
  item.textContent = `${data.username}: ${data.msg}`;

  item.addEventListener('click', function() {
    navigator.clipboard.writeText(`${data.username}: ${data.msg}`).then(() => {
      alert('Message copied to clipboard');
    });
  });

  if (data.username === username || isAdmin) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
      socket.emit('delete message', data.msgId);
    };
    item.appendChild(deleteButton);
  }

  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('user joined', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('user left', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('update user list', function(users) {
  userList.innerHTML = '';
  users.forEach(function(user) {
    const item = document.createElement('li');
    item.textContent = user.username;
    userList.appendChild(item);
  });
  if (isAdmin) {
    updateAdminControls();
  }
});

socket.on('kick', function(msg) {
  alert(msg);
  location.reload();
});

socket.on('ban', function(msg) {
  alert(msg);
  location.reload();
});

socket.on('muted', function(msg) {
  alert(msg);
});

socket.on('delete message', function(msgId) {
  const msgElement = document.getElementById(msgId);
  if (msgElement) {
    msgElement.remove();
  }
});