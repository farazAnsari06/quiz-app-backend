// server.js - Main server file

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const questionsRoutes = require('./routes/questions');
const Question = require('./models/Question');

// Initialize Express app
const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware


app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy does not allow access from this origin.'), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);

// Add this near the end of your server.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizApp';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
// API routes
app.use('/api/questions', questionsRoutes);

// Active game rooms
const gameRooms = {};

// Socket.io connection handling
io.on('connection', (socket) => {
 

  // Create a new game room
  socket.on('createRoom', ({ username, category }) => {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit room code
    
    gameRooms[roomId] = {
      id: roomId,
      players: [{
        id: socket.id,
        username,
        score: 0,
        isReady: false,
        isHost: true
      }],
      category,
      gameStarted: false,
      questions: [],
      currentQuestionIndex: 0
    };
    
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, isHost: true });
    
  });

  // Join an existing game room
  socket.on('joinRoom', ({ username, roomId }) => {
    const room = gameRooms[roomId];
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.gameStarted) {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    // Add player to room
    room.players.push({
      id: socket.id,
      username,
      score: 0,
      isReady: false,
      isHost: false
    });
    
    socket.join(roomId);
    socket.emit('roomJoined', { roomId, isHost: false });
    
    // Notify all players in the room about the new player
    io.to(roomId).emit('playerJoined', { 
      players: room.players.map(p => ({
        username: p.username,
        score: p.score,
        isReady: p.isReady,
        isHost: p.isHost
      }))
    });
    
    
  });

  // Player ready status
  socket.on('playerReady', ({ roomId }) => {
    const room = gameRooms[roomId];
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
      
      // Check if all players are ready
      const allReady = room.players.every(p => p.isReady);
      
      io.to(roomId).emit('playersUpdate', { 
        players: room.players.map(p => ({
          username: p.username,
          score: p.score,
          isReady: p.isReady,
          isHost: p.isHost
        })),
        allReady
      });
    }
  });

  // Start the game (host only)
  socket.on('startGame', async ({ roomId, category }) => {
    const room = gameRooms[roomId];
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;
    
    try {
      // Directly query the database instead of making an HTTP request
      const questions = await Question.aggregate([
        { $match: { category: category } },
        { $sample: { size: 15 } },
        { 
          $project: {
            _id: 1,
            question: 1,
            options: 1,
            correctAnswer: 1,
            category: 1,
            difficulty: 1
          }
        }
      ]);

      
      if (!questions || questions.length < 10) {
        io.to(roomId).emit('error', { message: 'Not enough questions available' });
        return;
      }
      
      room.questions = questions;
      room.gameStarted = true;
      room.category = category;
      room.currentQuestionIndex = 0;
      
      // Send the first question to all players
      io.to(roomId).emit('gameStarted', {
        question: {
          ...room.questions[0],
          answer: undefined // Don't send the answer to clients
        },
        totalQuestions: room.questions.length,
        currentQuestion: 1
      });
      
    } catch (err) {
      console.error('Error starting game:', err);
      io.to(roomId).emit('error', { message: 'Failed to start game' });
    }
  });

  // Handle answer submission
  socket.on('submitAnswer', ({ roomId, answer }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.gameStarted) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Mark this player as having answered
    player.hasAnswered = true;
    
    // Check if answer is correct
    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (currentQuestion.correctAnswer === answer) {
      player.score += 10; // Award 10 points for correct answer
    }
    
    // Check if all players have answered
    const allAnswered = room.players.every(p => p.hasAnswered);
    
    if (allAnswered) {
      // Move to the next question or end the game
      if (room.currentQuestionIndex < room.questions.length - 1) {
        room.currentQuestionIndex++;
        
        // Reset hasAnswered flag for all players
        room.players.forEach(p => {
          p.hasAnswered = false;
        });
        
        // Send the next question
        io.to(roomId).emit('nextQuestion', {
          question: {
            ...room.questions[room.currentQuestionIndex],
            answer: undefined
          },
          currentQuestion: room.currentQuestionIndex + 1,
          totalQuestions: room.questions.length,
          scores: room.players.map(p => ({
            username: p.username,
            score: p.score
          }))
        });
      } else {
        // End the game
        io.to(roomId).emit('gameOver', {
          scores: room.players.map(p => ({
            username: p.username,
            score: p.score
          })).sort((a, b) => b.score - a.score) // Sort by score descending
        });
        
        // Clean up the room after a delay
        setTimeout(() => {
          delete gameRooms[roomId];
        }, 60000); // Clean up after 1 minute
      }
    }
  });

  // Handle single player quiz start
  // Handle single player quiz start
socket.on('startSinglePlayer', async ({ category }) => {
  try {
    console.log(`Starting single player game for category: ${category}`);
    
    // Directly query the database instead of making an HTTP request
    const questions = await Question.aggregate([
      { $match: { category: category } },
      { $sample: { size: 15 } },
      { 
        $project: {
          _id: 1,
          question: 1,
          options: 1,
          correctAnswer: 1,
          category: 1,
          difficulty: 1
        }
      }
    ]);
    
    console.log(`Found ${questions.length} questions for category: ${category}`);
    
    if (questions.length < 2) {
      console.log('Not enough questions available');
      socket.emit('error', { message: 'Not enough questions available for this category' });
      return;
    }
    
    // Create a session ID for this single player game
    const sessionId = uuidv4();
    
    // Store the game session
    gameRooms[sessionId] = {
      id: sessionId,
      players: [{
        id: socket.id,
        username: 'Player',
        score: 0,
        isReady: true
      }],
      category,
      gameStarted: true,
      questions: questions,
      currentQuestionIndex: 0,
      singlePlayer: true
    };
    
    socket.join(sessionId);
    
    // Send the first question
    socket.emit('singlePlayerStarted', {
      sessionId,
      question: {
        ...questions[0],
        answer: undefined // Don't send the answer to client
      },
      totalQuestions: questions.length,
      currentQuestion: 1
    });
    
  } catch (err) {
    console.error('Error starting single player game:', err);
    socket.emit('error', { message: 'Failed to start game' });
  }
});

  // Handle single player answer submission
  socket.on('submitSinglePlayerAnswer', ({ sessionId, answer }) => {
    const session = gameRooms[sessionId];
    
    if (!session || !session.singlePlayer) return;
    
    const player = session.players[0];
    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    // Check if answer is correct
    let isCorrect = false;
    if (currentQuestion.correctAnswer === answer) {
      player.score += 10; // Award 10 points for correct answer
      isCorrect = true;
    }
    
    // Move to the next question or end the game
    if (session.currentQuestionIndex < session.questions.length - 1) {
      session.currentQuestionIndex++;
      
      // Send the next question
      socket.emit('singlePlayerNextQuestion', {
        question: {
          ...session.questions[session.currentQuestionIndex],
          answer: undefined
        },
        currentQuestion: session.currentQuestionIndex + 1,
        totalQuestions: session.questions.length,
        score: player.score,
        lastAnswerCorrect: isCorrect
      });
    } else {
      // End the game
      socket.emit('singlePlayerGameOver', {
        score: player.score,
        totalQuestions: session.questions.length
      });
      
      // Clean up the session
      delete gameRooms[sessionId];
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
   
    
    // Find any rooms the player is in
    for (const roomId in gameRooms) {
      const room = gameRooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Remove the player from the room
        room.players.splice(playerIndex, 1);
        
        // If no players left, delete the room
        if (room.players.length === 0) {
          delete gameRooms[roomId];
          
        } else {
          // Notify remaining players
          io.to(roomId).emit('playerLeft', { 
            players: room.players.map(p => ({
              username: p.username,
              score: p.score,
              isReady: p.isReady,
              isHost: p.isHost
            }))
          });
          
          // If the host left, assign a new host
          if (room.players.length > 0 && playerIndex === 0) {
            room.players[0].isHost = true;
            io.to(room.players[0].id).emit('becameHost');
          }
        }
      }
    }
  });

  // Add this to your socket.io connection handling
socket.on('resetRoom', ({ roomId }) => {
  const room = gameRooms[roomId];
  
  if (!room) {
    // Room doesn't exist anymore, create a new one
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
    
    gameRooms[newRoomId] = {
      id: newRoomId,
      players: [{
        id: socket.id,
        username: 'Player',
        score: 0,
        isReady: false,
        isHost: true,
        hasAnswered: false
      }],
      gameStarted: false,
      questions: [],
      currentQuestionIndex: 0
    };
    
    socket.join(newRoomId);
    socket.emit('roomCreated', { roomId: newRoomId, isHost: true });
  } else {
    // Reset the existing room
    room.players = room.players.filter(p => p.id === socket.id);
    room.gameStarted = false;
    room.questions = [];
    room.currentQuestionIndex = 0;
    
    // Update player properties
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.score = 0;
      player.isReady = false;
      player.hasAnswered = false;
      player.isHost = true;
    } else {
      // Add the player to the room if they're not already in it
      room.players.push({
        id: socket.id,
        username: 'Player',
        score: 0,
        isReady: false,
        isHost: true,
        hasAnswered: false
      });
    }
    
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, isHost: true });
  }
});

socket.on('rejoinRoom', ({ roomId, username, isHost }) => {
  const room = gameRooms[roomId];
  
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }
  
  // Check if player is already in the room
  const existingPlayer = room.players.find(p => p.id === socket.id);
  
  if (!existingPlayer) {
    // Add player to room
    room.players.push({
      id: socket.id,
      username,
      score: 0,
      isReady: false,
      isHost: isHost
    });
  }
  
  socket.join(roomId);
  
  // Notify all players in the room
  io.to(roomId).emit('playerJoined', { 
    players: room.players.map(p => ({
      username: p.username,
      score: p.score,
      isReady: p.isReady,
      isHost: p.isHost
    }))
  });
});



});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});