# QuizMaster - Real-Time Multiplayer Quiz App

A React Native mobile application where users can play trivia quizzes in single-player mode or challenge friends in real-time multiplayer matches.

## Features

- **Single-player** quiz mode with multiple categories
- **Real-time multiplayer** quiz battles using Socket.io
- Category selection with various topics (anime, movies, sports, general knowledge, etc.)
- Room creation system for private multiplayer matches
- Live scoring and leaderboards
- Responsive UI with animations

## Tech Stack

- **Frontend**: React Native (CLI) for mobile app development
- **Backend**: Express.js for API and Socket.io server
- **Database**: MongoDB for data storage
- **Real-time Communication**: Socket.io for multiplayer functionality

## Project Structure

```
quiz-app/
├── client/                  # React Native mobile app
│   ├── src/
│   │   ├── assets/          # Images, fonts and other assets
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Context providers (Socket.io)
│   │   └── screens/         # App screens
│   ├── App.js               # Entry point
│   └── package.json
│
├── server/                  # Express.js backend
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts (seeders)
│   ├── server.js            # Server entry point
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- Android Studio (for Android development) or Xcode (for iOS development)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/quiz-app.git
   cd quiz-app/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running locally or update the connection string in `server.js`.

4. Seed the database with sample questions:
   ```bash
   node scripts/seedQuestions.js
   ```

5. Start the server:
   ```bash
   npm start
   ```
   The server will run on http://localhost:3000

### Mobile App Setup

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the server URL in `src/context/SocketContext.js` to point to your backend server.

4. Run the app:

   For Android:
   ```bash
   npx react-native run-android
   ```

   For iOS:
   ```bash
   npx react-native run-ios
   ```

## Playing the Game

### Single-player Mode
1. Launch the app and tap "START"
2. Select "Single Player" mode
3. Choose a quiz category
4. Answer each question by tapping on an option
5. View your final score after completing all 20 questions

### Multiplayer Mode
1. Launch the app and tap "START"
2. Select "Multiplayer" mode
3. Enter your username
4. Create a room or join a friend's room using a 6-digit code
5. The host selects a category once all players are ready
6. Compete in real-time to answer questions
7. View the final leaderboard at the end of the game

## Custom Categories and Questions

You can add custom categories and questions by:
1. Updating the `categories` array in the `seedQuestions.js` file
2. Adding new questions to the `quizQuestions` array
3. Re-running the seeder script

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React Native](https://reactnative.dev/)
- [Socket.io](https://socket.io/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)