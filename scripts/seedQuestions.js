// scripts/seedQuestions.js
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Category = require('../models/Category');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Categories data
const categories = [
  {
    name: 'anime',
    description: 'Questions about anime and manga',
    iconName: 'film'
  },
  {
    name: 'movies',
    description: 'Questions about movies and TV series',
    iconName: 'video'
  },
  {
    name: 'sports',
    description: 'Questions about sports including UFC, football, basketball, etc.',
    iconName: 'activity'
  },
  {
    name: 'knowledge',
    description: 'General knowledge questions',
    iconName: 'book'
  },
  {
    name: 'technology',
    description: 'Questions about technology and computers',
    iconName: 'cpu'
  },
  {
    name: 'science',
    description: 'Scientific knowledge and discoveries',
    iconName: 'thermometer'
  },
  {
    name: 'history',
    description: 'Historical events and figures',
    iconName: 'clock'
  },
  {
    name: 'geography',
    description: 'Countries, cities, and natural features',
    iconName: 'globe'
  }
];

// Quiz questions data
const quizQuestions = [
  // Anime category questions
  {
    question: 'Which anime features a boy who can transform into a half-demon fox?',
    options: ['Naruto', 'One Piece', 'Dragon Ball Z', 'Bleach'],
    correctAnswer: 'Naruto',
    category: 'anime',
    difficulty: 'easy'
  },
  {
    question: 'In "Attack on Titan", what are the giant humanoids called?',
    options: ['Akuma', 'Homunculi', 'Titans', 'Hollows', 'Demons'],
    correctAnswer: 'Titans',
    category: 'anime',
    difficulty: 'easy'
  },
  {
    question: 'Which anime features a character named Edward Elric who lost his arm and leg?',
    options: ['Naruto', 'Fullmetal Alchemist', 'Bleach', 'My Hero Academia'],
    correctAnswer: 'Fullmetal Alchemist',
    category: 'anime',
    difficulty: 'medium'
  },
  {
    question: 'Which anime is set in a world where people have "Quirks" (superpowers)?',
    options: ['One Piece', 'Naruto', 'Demon Slayer', 'My Hero Academia'],
    correctAnswer: 'My Hero Academia',
    category: 'anime',
    difficulty: 'medium'
  },
  {
    question: 'In "Death Note", what is the name of the Shinigami who drops the Death Note?',
    options: ['Rem', 'Light', 'Ryuk', 'L', 'Misa'],
    correctAnswer: 'Ryuk',
    category: 'anime',
    difficulty: 'medium'
  },
  {
    question: 'Who is the main character in "One Piece"?',
    options: ['Zoro', 'Luffy', 'Nami', 'Sanji'],
    correctAnswer: 'Luffy',
    category: 'anime',
    difficulty: 'easy'
  },
  {
    question: 'What is the name of the protagonist in "Demon Slayer"?',
    options: ['Zenitsu', 'Inosuke', 'Nezuko', 'Tanjiro'],
    correctAnswer: 'Tanjiro',
    category: 'anime',
    difficulty: 'easy'
  },
  {
    question: 'In "Dragon Ball Z", what is the technique called when characters combine their power?',
    options: ['Spirit Bomb', 'Kamehameha', 'Fusion', 'Solar Flare'],
    correctAnswer: 'Fusion',
    category: 'anime',
    difficulty: 'medium'
  },
  {
    question: 'Who is the creator of "One Punch Man"?',
    options: ['Eiichiro Oda', 'Masashi Kishimoto', 'ONE', 'Akira Toriyama'],
    correctAnswer: 'ONE',
    category: 'anime',
    difficulty: 'hard'
  },
  {
    question: 'What is the name of the hidden village where Naruto lives?',
    options: ['Hidden Sand Village', 'Hidden Leaf Village', 'Hidden Mist Village', 'Hidden Cloud Village'],
    correctAnswer: 'Hidden Leaf Village',
    category: 'anime',
    difficulty: 'easy'
  },
  
  // Movies/TV Series category questions
  {
    question: 'Who directed the movie "Inception"?',
    options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Quentin Tarantino'],
    correctAnswer: 'Christopher Nolan',
    category: 'movies',
    difficulty: 'medium'
  },
  {
    question: 'Which actor played Iron Man in the Marvel Cinematic Universe?',
    options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'],
    correctAnswer: 'Robert Downey Jr.',
    category: 'movies',
    difficulty: 'easy'
  },
  {
    question: 'What was the first feature-length animated movie ever released?',
    options: ['Snow White and the Seven Dwarfs', 'Pinocchio', 'Fantasia', 'Dumbo'],
    correctAnswer: 'Snow White and the Seven Dwarfs',
    category: 'movies',
    difficulty: 'medium'
  },
  {
    question: 'In "The Matrix", what pill does Neo take?',
    options: ['Blue Pill', 'Red Pill', 'Green Pill', 'Yellow Pill'],
    correctAnswer: 'Red Pill',
    category: 'movies',
    difficulty: 'easy'
  },
  {
    question: 'Which TV series is set in the fictional continent of Westeros?',
    options: ['The Witcher', 'Game of Thrones', 'Lord of the Rings', 'The Wheel of Time'],
    correctAnswer: 'Game of Thrones',
    category: 'movies',
    difficulty: 'easy'
  },
  {
    question: 'Who played the character of Jack in the movie "Titanic"?',
    options: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Johnny Depp'],
    correctAnswer: 'Leonardo DiCaprio',
    category: 'movies',
    difficulty: 'easy'
  },
  {
    question: 'Which movie won the Academy Award for Best Picture in 2020?',
    options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
    correctAnswer: 'Parasite',
    category: 'movies',
    difficulty: 'medium'
  },
  {
    question: 'In "Harry Potter", what house is Harry sorted into?',
    options: ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'],
    correctAnswer: 'Gryffindor',
    category: 'movies',
    difficulty: 'easy'
  },
  {
    question: 'What is the name of the fictional metal in the Marvel Universe that Captain America\'s shield is made of?',
    options: ['Adamantium', 'Vibranium', 'Unobtainium', 'Kryptonite'],
    correctAnswer: 'Vibranium',
    category: 'movies',
    difficulty: 'medium'
  },
  {
    question: 'Which of these TV shows is NOT set in a hospital?',
    options: ['Grey\'s Anatomy', 'Scrubs', 'House', 'Breaking Bad'],
    correctAnswer: 'Breaking Bad',
    category: 'movies',
    difficulty: 'easy'
  },
  
  // Sports category questions
  {
    question: 'Who holds the record for the most UFC title defenses?',
    options: ['Jon Jones', 'Anderson Silva', 'Georges St-Pierre', 'Demetrious Johnson'],
    correctAnswer: 'Demetrious Johnson',
    category: 'sports',
    difficulty: 'medium'
  },
  {
    question: 'Which team has won the most NBA championships?',
    options: ['Chicago Bulls', 'Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors'],
    correctAnswer: 'Boston Celtics',
    category: 'sports',
    difficulty: 'medium'
  },
  {
    question: 'In which sport would you perform a slam dunk?',
    options: ['Football', 'Basketball', 'Tennis', 'Hockey'],
    correctAnswer: 'Basketball',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    question: 'How many players are on a standard soccer (football) team on the field?',
    options: ['9', '10', '11', '12'],
    correctAnswer: '11',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    question: 'Which country won the FIFA World Cup in 2018?',
    options: ['Brazil', 'Germany', 'France', 'Argentina'],
    correctAnswer: 'France',
    category: 'sports',
    difficulty: 'medium'
  },
  {
    question: 'What is the diameter of a basketball hoop in inches?',
    options: ['16 inches', '18 inches', '20 inches', '24 inches'],
    correctAnswer: '18 inches',
    category: 'sports',
    difficulty: 'hard'
  },
  {
    question: 'Which UFC fighter is known as "The Notorious"?',
    options: ['Khabib Nurmagomedov', 'Conor McGregor', 'Jon Jones', 'Israel Adesanya'],
    correctAnswer: 'Conor McGregor',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    question: 'In baseball, how many strikes constitute an out?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '3',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    question: 'Which Grand Slam tennis tournament is played on a clay court?',
    options: ['Wimbledon', 'US Open', 'Australian Open', 'French Open'],
    correctAnswer: 'French Open',
    category: 'sports',
    difficulty: 'medium'
  },
  {
    question: 'In American football, how many points is a touchdown worth?',
    options: ['3', '6', '7', '2'],
    correctAnswer: '6',
    category: 'sports',
    difficulty: 'easy'
  },
  
  // General Knowledge category questions
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 'William Shakespeare',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 'Au',
    category: 'knowledge',
    difficulty: 'medium'
  },
  {
    question: 'Which of these is NOT a primary color?',
    options: ['Red', 'Blue', 'Yellow', 'Green'],
    correctAnswer: 'Green',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 'Pacific Ocean',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'Which of these elements is a noble gas?',
    options: ['Oxygen', 'Hydrogen', 'Helium', 'Carbon'],
    correctAnswer: 'Helium',
    category: 'knowledge',
    difficulty: 'medium'
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 'Leonardo da Vinci',
    category: 'knowledge',
    difficulty: 'easy'
  },
  {
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correctAnswer: '2',
    category: 'knowledge',
    difficulty: 'medium'
  },
  {
    question: 'Which of these animals is NOT a mammal?',
    options: ['Dolphin', 'Bat', 'Kangaroo', 'Snake'],
    correctAnswer: 'Snake',
    category: 'knowledge',
    difficulty: 'easy'
  },
  
  // Technology category questions
  {
    question: 'Who is the co-founder of Microsoft alongside Bill Gates?',
    options: ['Steve Jobs', 'Paul Allen', 'Elon Musk', 'Mark Zuckerberg'],
    correctAnswer: 'Paul Allen',
    category: 'technology',
    difficulty: 'medium'
  },
  {
    question: 'What does "HTTP" stand for?',
    options: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'Hyper Transfer Technology Protocol', 'Home Tool Technical Page'],
    correctAnswer: 'HyperText Transfer Protocol',
    category: 'technology',
    difficulty: 'medium'
  },
  {
    question: 'What year was the first iPhone released?',
    options: ['2005', '2007', '2009', '2010'],
    correctAnswer: '2007',
    category: 'technology',
    difficulty: 'medium'
  },
  {
    question: 'Which programming language is known for its use in artificial intelligence and machine learning?',
    options: ['Java', 'C++', 'Python', 'Ruby'],
    correctAnswer: 'Python',
    category: 'technology',
    difficulty: 'medium'
  },
  {
    question: 'What does "CPU" stand for?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Central Processor Undertaking'],
    correctAnswer: 'Central Processing Unit',
    category: 'technology',
    difficulty: 'easy'
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Question.deleteMany({});
    
    // Insert categories
    await Category.insertMany(categories);
    
    
    // Insert questions
    await Question.insertMany(quizQuestions);
   
    
   
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();

module.exports = { categories, quizQuestions };