// index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files from the 'public' directory
// Your .html file goes in there
app.use(express.static(path.join(__dirname, 'public')));

// Variable to store the HTML content and textarea value
let htmlContent = '';
let textareaValue = '';
let scrollY = 0; // Store the current scroll position

// Socket.IO connection event handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit the HTML file, textarea value, and scroll position to the new client
  socket.emit('htmlUpdate', { html: htmlContent, textareaValue, scrollY });

  // Socket.IO event handler for HTML and textarea value updates from clients
  socket.on('htmlUpdate', (updatedData) => {
    // Update the HTML content and textarea value
    htmlContent = updatedData.html;
    textareaValue = updatedData.textareaValue;

    // Broadcast the HTML and textarea value update to other clients
    socket.broadcast.emit('htmlUpdate', updatedData);
  });

  // Socket.IO event handler for scroll position updates from clients
  socket.on('scrollUpdate', (updatedScrollY) => {
    // Update the scroll position
    scrollY = updatedScrollY;

    // Broadcast the scroll position update to other clients
    socket.broadcast.emit('scrollUpdate', scrollY);
  });

  // Socket.IO disconnect event handler
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});