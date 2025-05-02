// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Category = require('../models/Category');

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    console.log("api hitted")
    const categories = await Category.find({ isActive: true }).select('name description iconName');
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions by category
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;

    console.log(category, difficulty, limit);
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Get random questions in the specified category
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } },
      { $project: {
        _id: 1,
        question: 1,
        options: 1,
        correctAnswer: 1,
        category: 1,
        difficulty: 1
      }}
    ]);
    
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this category' });
    }
    
    res.json({ questions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new question (admin only - would need auth middleware in production)
router.post('/', async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;
    
    if (!question || !options || !correctAnswer || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate that correctAnswer is one of the options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }
    
    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category,
      difficulty: difficulty || 'medium'
    });
    
    await newQuestion.save();
    
    res.status(201).json({ 
      message: 'Question created successfully',
      question: newQuestion
    });
  } catch (err) {
    console.error('Error creating question:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed initial categories
router.post('/seed-categories', async (req, res) => {
  try {
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
    
    await Category.deleteMany({}); // Clear existing categories
    await Category.insertMany(categories);
    
    res.status(201).json({ 
      message: 'Categories seeded successfully',
      count: categories.length
    });
  } catch (err) {
    console.error('Error seeding categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sample questions seeder
router.post('/seed-questions', async (req, res) => {
  try {
    // Example anime questions
    const animeQuestions = [
      {
        question: 'Which anime features a boy who can transform into a half-demon fox?',
        options: ['Naruto', 'One Piece', 'Dragon Ball Z', 'Bleach'],
        correctAnswer: 'Naruto',
        category: 'anime'
      },
      {
        question: 'In "Attack on Titan", what are the giant humanoids called?',
        options: ['Akuma', 'Homunculi', 'Titans', 'Hollows'],
        correctAnswer: 'Titans',
        category: 'anime'
      },
      {
        question: 'Who is the main character in "One Piece"?',
        options: ['Zoro', 'Luffy', 'Nami', 'Sanji'],
        correctAnswer: 'Luffy',
        category: 'anime'
      },
      {
        question: 'What is the name of the protagonist in "Demon Slayer"?',
        options: ['Zenitsu', 'Inosuke', 'Nezuko', 'Tanjiro'],
        correctAnswer: 'Tanjiro',
        category: 'anime'
      },
      {
        question: 'In "Dragon Ball Z", what is the technique called when characters combine their power?',
        options: ['Spirit Bomb', 'Kamehameha', 'Fusion', 'Solar Flare'],
        correctAnswer: 'Fusion',
        category: 'anime'
      },
      {
        question: 'Which anime features a notebook that can kill anyone whose name is written in it?',
        options: ['Fullmetal Alchemist', 'Death Note', 'Tokyo Ghoul', 'Black Butler'],
        correctAnswer: 'Death Note',
        category: 'anime'
      },
      {
        question: 'What is the name of the world in Sword Art Online?',
        options: ['Aincrad', 'Midgar', 'Palutena', 'Gensokyo'],
        correctAnswer: 'Aincrad',
        category: 'anime'
      },
      {
        question: 'Who is the alchemist with a metal arm in "Fullmetal Alchemist"?',
        options: ['Alphonse Elric', 'Edward Elric', 'Roy Mustang', 'Scar'],
        correctAnswer: 'Edward Elric',
        category: 'anime'
      },
      {
        question: 'In "My Hero Academia", what is Deku’s real name?',
        options: ['Shoto Todoroki', 'Katsuki Bakugo', 'Izuku Midoriya', 'Tenya Iida'],
        correctAnswer: 'Izuku Midoriya',
        category: 'anime'
      },
      {
        question: 'Which anime features psychic middle schooler Shigeo Kageyama?',
        options: ['Mob Psycho 100', 'Psycho-Pass', 'Parasyte', 'Erased'],
        correctAnswer: 'Mob Psycho 100',
        category: 'anime'
      },
      {
        question: 'What is the name of the deadly game in "Hunter x Hunter"?',
        options: ['Heaven’s Arena', 'Greed Island', 'Phantom Trials', 'Hunter’s Brawl'],
        correctAnswer: 'Greed Island',
        category: 'anime'
      },
      {
        question: 'Who uses the Rasengan technique?',
        options: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake', 'Jiraiya'],
        correctAnswer: 'Naruto Uzumaki',
        category: 'anime'
      },
      {
        question: 'In "Tokyo Ghoul", what does Kaneki turn into?',
        options: ['Vampire', 'Ghoul', 'Demon', 'Cyborg'],
        correctAnswer: 'Ghoul',
        category: 'anime'
      },
      {
        question: 'Which anime is set in the Hidden Leaf Village?',
        options: ['Bleach', 'Naruto', 'Fairy Tail', 'Attack on Titan'],
        correctAnswer: 'Naruto',
        category: 'anime'
      },
      {
        question: 'What weapon does Ichigo wield in Bleach?',
        options: ['Spear', 'Zanpakuto', 'Gunblade', 'Kunai'],
        correctAnswer: 'Zanpakuto',
        category: 'anime'
      },
      {
        question: 'In "One Punch Man", what is Saitama’s biggest problem?',
        options: ['Too strong', 'Too slow', 'Too emotional', 'Too proud'],
        correctAnswer: 'Too strong',
        category: 'anime'
      },
      {
        question: 'What anime is about a group of students assassinating their teacher?',
        options: ['Assassination Classroom', 'Death Parade', 'Code Geass', 'Your Lie in April'],
        correctAnswer: 'Assassination Classroom',
        category: 'anime'
      },
      {
        question: 'Who is known as the Flame Alchemist?',
        options: ['Edward Elric', 'Roy Mustang', 'Scar', 'Maes Hughes'],
        correctAnswer: 'Roy Mustang',
        category: 'anime'
      },
      {
        question: 'Which anime has a character named Light Yagami?',
        options: ['Code Geass', 'Death Note', 'Bleach', 'Erased'],
        correctAnswer: 'Death Note',
        category: 'anime'
      },
      {
        question: 'What is the goal of the Straw Hat Pirates?',
        options: ['Save the world', 'Collect gems', 'Find One Piece', 'Become ninjas'],
        correctAnswer: 'Find One Piece',
        category: 'anime'
      },
      {
        question: 'Who is the strongest Saiyan in Dragon Ball Super?',
        options: ['Vegeta', 'Trunks', 'Goku', 'Broly'],
        correctAnswer: 'Goku',
        category: 'anime'
      },
      {
        question: 'What anime features a butler named Sebastian?',
        options: ['Black Butler', 'Fruits Basket', 'Inuyasha', 'Clannad'],
        correctAnswer: 'Black Butler',
        category: 'anime'
      },
      {
        question: 'What is the main theme of "Your Lie in April"?',
        options: ['Cooking', 'Music', 'Fighting', 'Robots'],
        correctAnswer: 'Music',
        category: 'anime'
      },
      {
        question: 'What school does Class 1-A attend?',
        options: ['Tokyo High', 'U.A. High School', 'Shinigami Academy', 'Hanekawa Institute'],
        correctAnswer: 'U.A. High School',
        category: 'anime'
      },
      {
        question: 'Who is the homeroom teacher of Class 1-A?',
        options: ['All Might', 'Endeavor', 'Shoto Aizawa', 'Hawks'],
        correctAnswer: 'Shoto Aizawa',
        category: 'anime'
      },
      {
        question: 'Which anime is based on notebook-based deadly powers?',
        options: ['Bleach', 'Death Note', 'Naruto', 'Erased'],
        correctAnswer: 'Death Note',
        category: 'anime'
      },
      {
        question: 'In "Haikyuu!!", what sport is played?',
        options: ['Basketball', 'Tennis', 'Volleyball', 'Baseball'],
        correctAnswer: 'Volleyball',
        category: 'anime'
      },
      {
        question: 'Who is Levi Ackerman?',
        options: ['Mage', 'Captain', 'Student', 'Assassin'],
        correctAnswer: 'Captain',
        category: 'anime'
      },
      {
        question: 'What type of creature is Nezuko in Demon Slayer?',
        options: ['Ghost', 'Demon', 'Human', 'Fairy'],
        correctAnswer: 'Demon',
        category: 'anime'
      },
      {
        question: 'What is the name of Goku’s father?',
        options: ['Vegeta', 'Bardock', 'Raditz', 'Beerus'],
        correctAnswer: 'Bardock',
        category: 'anime'
      },
      {
        question: 'In "Naruto", what is the name of Naruto’s son?',
        options: ['Minato', 'Sasuke', 'Boruto', 'Konohamaru'],
        correctAnswer: 'Boruto',
        category: 'anime'
      },
      {
        question: 'Which anime is famous for alchemy and the Philosopher’s Stone?',
        options: ['Fairy Tail', 'Naruto', 'Fullmetal Alchemist', 'Bleach'],
        correctAnswer: 'Fullmetal Alchemist',
        category: 'anime'
      },
      {
        question: 'Who is the main female lead in "Inuyasha"?',
        options: ['Kagome', 'Sango', 'Kikyo', 'Rin'],
        correctAnswer: 'Kagome',
        category: 'anime'
      },
      {
        question: 'Which anime has cards that grant magical powers?',
        options: ['Cardcaptor Sakura', 'Beyblade', 'Yu-Gi-Oh!', 'Naruto'],
        correctAnswer: 'Cardcaptor Sakura',
        category: 'anime'
      },
      {
        question: 'Which anime has a main character who pilots an Eva unit?',
        options: ['Gundam', 'Code Geass', 'Neon Genesis Evangelion', 'Trigun'],
        correctAnswer: 'Neon Genesis Evangelion',
        category: 'anime'
      },
      {
        question: 'What is the name of Luffy’s brother in One Piece?',
        options: ['Zoro', 'Ace', 'Sanji', 'Usopp'],
        correctAnswer: 'Ace',
        category: 'anime'
      },
      {
        question: 'Which anime features a guild called Fairy Tail?',
        options: ['Black Clover', 'One Piece', 'Fairy Tail', 'Bleach'],
        correctAnswer: 'Fairy Tail',
        category: 'anime'
      },
      {
        question: 'What’s the weapon of choice for Guts in Berserk?',
        options: ['Katana', 'Scythe', 'Sword', 'Gun'],
        correctAnswer: 'Sword',
        category: 'anime'
      },
      {
        question: 'In "Erased", what power does the main character have?',
        options: ['Teleportation', 'Time travel', 'Mind reading', 'Illusions'],
        correctAnswer: 'Time travel',
        category: 'anime'
      }
    ];
    
    
    // Example movies questions
    const moviesQuestions = [
      {
        question: 'Who directed the movie "Inception"?',
        options: ['Christopher Nolan', 'Steven Spielberg', 'James Cameron', 'Quentin Tarantino'],
        correctAnswer: 'Christopher Nolan',
        category: 'movies'
      },
      {
        question: 'Which actor played Iron Man in the Marvel Cinematic Universe?',
        options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'],
        correctAnswer: 'Robert Downey Jr.',
        category: 'movies'
      },
      {
        question: 'What was the first feature-length animated movie ever released?',
        options: ['Snow White and the Seven Dwarfs', 'Pinocchio', 'Fantasia', 'Dumbo'],
        correctAnswer: 'Snow White and the Seven Dwarfs',
        category: 'movies'
      },
      {
        question: 'In "The Matrix", what pill does Neo take?',
        options: ['Blue Pill', 'Red Pill', 'Green Pill', 'Yellow Pill'],
        correctAnswer: 'Red Pill',
        category: 'movies'
      },
      {
        question: 'Which TV series is set in the fictional continent of Westeros?',
        options: ['The Witcher', 'Game of Thrones', 'Lord of the Rings', 'The Wheel of Time'],
        correctAnswer: 'Game of Thrones',
        category: 'movies'
      },
      {
        question: 'Who played the character of Jack in the movie "Titanic"?',
        options: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Johnny Depp'],
        correctAnswer: 'Leonardo DiCaprio',
        category: 'movies'
      },
      {
        question: 'Which movie features a character named Forrest who loves to run?',
        options: ['Cast Away', 'Forrest Gump', 'The Green Mile', 'Saving Private Ryan'],
        correctAnswer: 'Forrest Gump',
        category: 'movies'
      },
      {
        question: 'What is the name of the hobbit played by Elijah Wood in "The Lord of the Rings"?',
        options: ['Bilbo', 'Sam', 'Frodo', 'Merry'],
        correctAnswer: 'Frodo',
        category: 'movies'
      },
      {
        question: 'Which movie is famous for the quote "Say hello to my little friend"?',
        options: ['Scarface', 'Goodfellas', 'The Godfather', 'Casino'],
        correctAnswer: 'Scarface',
        category: 'movies'
      },
      {
        question: 'Who directed "Pulp Fiction"?',
        options: ['Martin Scorsese', 'Quentin Tarantino', 'Ridley Scott', 'Guy Ritchie'],
        correctAnswer: 'Quentin Tarantino',
        category: 'movies'
      },
      {
        question: 'What is the highest-grossing movie of all time as of 2024?',
        options: ['Titanic', 'Avatar', 'Avengers: Endgame', 'Star Wars: The Force Awakens'],
        correctAnswer: 'Avatar',
        category: 'movies'
      },
      {
        question: 'Which actor voiced Woody in "Toy Story"?',
        options: ['Tim Allen', 'Tom Hanks', 'Billy Crystal', 'Robin Williams'],
        correctAnswer: 'Tom Hanks',
        category: 'movies'
      },
      {
        question: 'Which film franchise features a character named John Wick?',
        options: ['The Equalizer', 'Taken', 'John Wick', 'Mission: Impossible'],
        correctAnswer: 'John Wick',
        category: 'movies'
      },
      {
        question: 'Who played the Joker in "The Dark Knight"?',
        options: ['Jared Leto', 'Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson'],
        correctAnswer: 'Heath Ledger',
        category: 'movies'
      },
      {
        question: 'In which movie do dinosaurs escape from an island park?',
        options: ['Jurassic Park', 'Kong: Skull Island', 'The Meg', 'Land of the Lost'],
        correctAnswer: 'Jurassic Park',
        category: 'movies'
      },
      {
        question: 'Which 1994 movie was based on a Stephen King novella and set in a prison?',
        options: ['The Green Mile', 'The Shining', 'Misery', 'The Shawshank Redemption'],
        correctAnswer: 'The Shawshank Redemption',
        category: 'movies'
      },
      {
        question: 'What is the name of the fictional African country in "Black Panther"?',
        options: ['Zamunda', 'Genovia', 'Wakanda', 'Latveria'],
        correctAnswer: 'Wakanda',
        category: 'movies'
      },
      {
        question: 'Which actor starred in "Mission: Impossible" series?',
        options: ['Brad Pitt', 'Matt Damon', 'Tom Cruise', 'Ben Affleck'],
        correctAnswer: 'Tom Cruise',
        category: 'movies'
      },
      {
        question: 'What is the title of the first Harry Potter movie?',
        options: ['The Goblet of Fire', 'The Philosopher\'s Stone', 'The Chamber of Secrets', 'The Sorcerer\'s Stone'],
        correctAnswer: 'The Philosopher\'s Stone',
        category: 'movies'
      },
      {
        question: 'Who directed "The Godfather"?',
        options: ['Martin Scorsese', 'Francis Ford Coppola', 'Brian De Palma', 'Stanley Kubrick'],
        correctAnswer: 'Francis Ford Coppola',
        category: 'movies'
      },
      {
        question: 'Which 2010 film features dreams within dreams?',
        options: ['Interstellar', 'Inception', 'Tenet', 'The Prestige'],
        correctAnswer: 'Inception',
        category: 'movies'
      },
      {
        question: 'In which movie does a character say, "I’m the king of the world!"?',
        options: ['Braveheart', 'Gladiator', 'Titanic', 'The Lion King'],
        correctAnswer: 'Titanic',
        category: 'movies'
      },
      {
        question: 'What is the name of the AI in "2001: A Space Odyssey"?',
        options: ['GLaDOS', 'TARS', 'HAL 9000', 'Samantha'],
        correctAnswer: 'HAL 9000',
        category: 'movies'
      },
      {
        question: 'Which actor played Deadpool?',
        options: ['Hugh Jackman', 'Chris Pratt', 'Ryan Reynolds', 'Paul Rudd'],
        correctAnswer: 'Ryan Reynolds',
        category: 'movies'
      },
      {
        question: 'Which movie is about a clown haunting children in Derry?',
        options: ['IT', 'The Conjuring', 'Sinister', 'Annabelle'],
        correctAnswer: 'IT',
        category: 'movies'
      },
      {
        question: 'Which movie has a robot named WALL-E?',
        options: ['Big Hero 6', 'Robots', 'WALL-E', 'The Iron Giant'],
        correctAnswer: 'WALL-E',
        category: 'movies'
      },
      {
        question: 'Who played Batman in "The Dark Knight" trilogy?',
        options: ['Ben Affleck', 'Robert Pattinson', 'Christian Bale', 'Michael Keaton'],
        correctAnswer: 'Christian Bale',
        category: 'movies'
      },
      {
        question: 'Which musical features songs like "Do-Re-Mi" and "My Favorite Things"?',
        options: ['Chicago', 'The Sound of Music', 'Mamma Mia!', 'Les Misérables'],
        correctAnswer: 'The Sound of Music',
        category: 'movies'
      },
      {
        question: 'In which film do toys come to life when humans are not around?',
        options: ['Small Soldiers', 'Toy Story', 'The Lego Movie', 'Inside Out'],
        correctAnswer: 'Toy Story',
        category: 'movies'
      },
      {
        question: 'What is the name of the main character in "The Revenant"?',
        options: ['Jordan Belfort', 'Jack Dawson', 'Hugh Glass', 'Dom Cobb'],
        correctAnswer: 'Hugh Glass',
        category: 'movies'
      },
      {
        question: 'Which 1999 movie features the quote "I see dead people"?',
        options: ['The Sixth Sense', 'The Others', 'Insidious', 'Poltergeist'],
        correctAnswer: 'The Sixth Sense',
        category: 'movies'
      },
      {
        question: 'Which actor starred as Wolverine in the X-Men series?',
        options: ['Hugh Jackman', 'Chris Hemsworth', 'Tom Hardy', 'Gerard Butler'],
        correctAnswer: 'Hugh Jackman',
        category: 'movies'
      },
      {
        question: 'What movie features time travel in a DeLorean car?',
        options: ['Looper', 'Back to the Future', 'Tenet', 'Timecop'],
        correctAnswer: 'Back to the Future',
        category: 'movies'
      },
      {
        question: 'Who played the Genie in the 2019 live-action "Aladdin"?',
        options: ['Will Smith', 'Jamie Foxx', 'Eddie Murphy', 'Kevin Hart'],
        correctAnswer: 'Will Smith',
        category: 'movies'
      },
      {
        question: 'What is the subtitle of "Avatar 2"?',
        options: ['The Rise of Eywa', 'Return to Pandora', 'The Way of Water', 'The Spirit Tree'],
        correctAnswer: 'The Way of Water',
        category: 'movies'
      },
      {
        question: 'Which film won Best Picture at the 2020 Oscars?',
        options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
        correctAnswer: 'Parasite',
        category: 'movies'
      },
      {
        question: 'In "Frozen", what is the name of the snowman?',
        options: ['Sven', 'Olaf', 'Kristoff', 'Hans'],
        correctAnswer: 'Olaf',
        category: 'movies'
      }
    ];
    
    
    // Example sports questions
    const sportsQuestions = [
      {
        question: 'Who holds the record for the most UFC title defenses?',
        options: ['Jon Jones', 'Anderson Silva', 'Georges St-Pierre', 'Demetrious Johnson'],
        correctAnswer: 'Demetrious Johnson',
        category: 'sports'
      },
      {
        question: 'Which team has won the most NBA championships?',
        options: ['Chicago Bulls', 'Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors'],
        correctAnswer: 'Boston Celtics',
        category: 'sports'
      },
      {
        question: 'In which sport would you perform a slam dunk?',
        options: ['Football', 'Basketball', 'Tennis', 'Hockey'],
        correctAnswer: 'Basketball',
        category: 'sports'
      },
      {
        question: 'How many players are on a standard soccer team on the field?',
        options: ['9', '10', '11', '12'],
        correctAnswer: '11',
        category: 'sports'
      },
      {
        question: 'Which country won the FIFA World Cup in 2018?',
        options: ['Brazil', 'Germany', 'France', 'Argentina'],
        correctAnswer: 'France',
        category: 'sports'
      },
      {
        question: 'Which UFC fighter is known as "The Notorious"?',
        options: ['Khabib Nurmagomedov', 'Conor McGregor', 'Jon Jones', 'Israel Adesanya'],
        correctAnswer: 'Conor McGregor',
        category: 'sports'
      },
      {
        question: 'How many points is a touchdown worth in American football?',
        options: ['3', '6', '7', '2'],
        correctAnswer: '6',
        category: 'sports'
      },
      {
        question: 'What is the maximum score in a single frame of bowling?',
        options: ['20', '30', '15', '25'],
        correctAnswer: '30',
        category: 'sports'
      },
      {
        question: 'Who is known as the fastest man in the world?',
        options: ['Usain Bolt', 'Tyson Gay', 'Carl Lewis', 'Yohan Blake'],
        correctAnswer: 'Usain Bolt',
        category: 'sports'
      },
      {
        question: 'Which country hosts the Tour de France?',
        options: ['Italy', 'Germany', 'France', 'Spain'],
        correctAnswer: 'France',
        category: 'sports'
      },
      {
        question: 'How many rings are there on the Olympic flag?',
        options: ['4', '5', '6', '7'],
        correctAnswer: '5',
        category: 'sports'
      },
      {
        question: 'What sport does Lionel Messi play?',
        options: ['Tennis', 'Basketball', 'Soccer', 'Rugby'],
        correctAnswer: 'Soccer',
        category: 'sports'
      },
      {
        question: 'Which tennis player has won the most Grand Slam titles (as of 2024)?',
        options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
        correctAnswer: 'Novak Djokovic',
        category: 'sports'
      },
      {
        question: 'In what sport would you use a shuttlecock?',
        options: ['Squash', 'Badminton', 'Table Tennis', 'Tennis'],
        correctAnswer: 'Badminton',
        category: 'sports'
      },
      {
        question: 'Which country has won the most Olympic gold medals?',
        options: ['China', 'USA', 'Russia', 'Germany'],
        correctAnswer: 'USA',
        category: 'sports'
      },
      {
        question: 'Which NBA player is known as "King James"?',
        options: ['Stephen Curry', 'Kobe Bryant', 'Kevin Durant', 'LeBron James'],
        correctAnswer: 'LeBron James',
        category: 'sports'
      },
      {
        question: 'What does VAR stand for in soccer?',
        options: ['Video Assistant Referee', 'Virtual Action Replay', 'Verified Athlete Referee', 'Video Analysis Rule'],
        correctAnswer: 'Video Assistant Referee',
        category: 'sports'
      },
      {
        question: 'Which country won the 2022 FIFA World Cup?',
        options: ['Brazil', 'France', 'Germany', 'Argentina'],
        correctAnswer: 'Argentina',
        category: 'sports'
      },
      {
        question: 'In which sport is the Stanley Cup awarded?',
        options: ['Basketball', 'Ice Hockey', 'Baseball', 'Rugby'],
        correctAnswer: 'Ice Hockey',
        category: 'sports'
      },
      {
        question: 'How many players are there on a baseball team on the field?',
        options: ['7', '8', '9', '10'],
        correctAnswer: '9',
        category: 'sports'
      },
      {
        question: 'Which country invented cricket?',
        options: ['India', 'Australia', 'England', 'South Africa'],
        correctAnswer: 'England',
        category: 'sports'
      },
      {
        question: 'What is the distance of a marathon?',
        options: ['26.2 miles', '21 miles', '24 miles', '20 miles'],
        correctAnswer: '26.2 miles',
        category: 'sports'
      },
      {
        question: 'Who won the NBA MVP award in 2023?',
        options: ['Nikola Jokic', 'Joel Embiid', 'Stephen Curry', 'Luka Doncic'],
        correctAnswer: 'Joel Embiid',
        category: 'sports'
      },
      {
        question: 'Which footballer is known as "CR7"?',
        options: ['Cristiano Ronaldo', 'Carlos Rodriguez', 'Cesc Fabregas', 'Ronaldinho'],
        correctAnswer: 'Cristiano Ronaldo',
        category: 'sports'
      },
      {
        question: 'Which sport is known as the "king of sports"?',
        options: ['Cricket', 'Basketball', 'Soccer', 'Tennis'],
        correctAnswer: 'Soccer',
        category: 'sports'
      },
      {
        question: 'Which athlete has won the most Olympic medals?',
        options: ['Mark Spitz', 'Usain Bolt', 'Larisa Latynina', 'Michael Phelps'],
        correctAnswer: 'Michael Phelps',
        category: 'sports'
      },
      {
        question: 'How long is a rugby union match?',
        options: ['60 minutes', '70 minutes', '80 minutes', '90 minutes'],
        correctAnswer: '80 minutes',
        category: 'sports'
      },
      {
        question: 'Which boxer was known as "The Greatest"?',
        options: ['Mike Tyson', 'Muhammad Ali', 'Floyd Mayweather', 'Joe Frazier'],
        correctAnswer: 'Muhammad Ali',
        category: 'sports'
      },
      {
        question: 'What color jersey does the leader of the Tour de France wear?',
        options: ['Red', 'Blue', 'Yellow', 'Green'],
        correctAnswer: 'Yellow',
        category: 'sports'
      },
      {
        question: 'Which team won the 2023 Super Bowl?',
        options: ['Eagles', '49ers', 'Chiefs', 'Bengals'],
        correctAnswer: 'Chiefs',
        category: 'sports'
      },
      {
        question: 'What is the name of the Major League Baseball championship?',
        options: ['The Grand Slam', 'World Cup', 'World Series', 'Super Bowl'],
        correctAnswer: 'World Series',
        category: 'sports'
      },
      {
        question: 'In which country are the headquarters of the International Olympic Committee?',
        options: ['USA', 'Switzerland', 'France', 'UK'],
        correctAnswer: 'Switzerland',
        category: 'sports'
      },
      {
        question: 'Which sport uses a pommel horse?',
        options: ['Wrestling', 'Gymnastics', 'Fencing', 'Diving'],
        correctAnswer: 'Gymnastics',
        category: 'sports'
      },
      {
        question: 'How many holes are there in a standard round of golf?',
        options: ['9', '18', '12', '15'],
        correctAnswer: '18',
        category: 'sports'
      },
      {
        question: 'Which team won the 2022 UEFA Champions League?',
        options: ['Manchester City', 'Real Madrid', 'Bayern Munich', 'Chelsea'],
        correctAnswer: 'Real Madrid',
        category: 'sports'
      },
      {
        question: 'What surface is the French Open tennis tournament played on?',
        options: ['Hard court', 'Clay', 'Grass', 'Carpet'],
        correctAnswer: 'Clay',
        category: 'sports'
      },
      {
        question: 'Who was the first female gymnast to score a perfect 10 in the Olympics?',
        options: ['Simone Biles', 'Mary Lou Retton', 'Nadia Comaneci', 'Shannon Miller'],
        correctAnswer: 'Nadia Comaneci',
        category: 'sports'
      },
      {
        question: 'Which NFL quarterback has won the most Super Bowl titles?',
        options: ['Peyton Manning', 'Tom Brady', 'Joe Montana', 'Aaron Rodgers'],
        correctAnswer: 'Tom Brady',
        category: 'sports'
      },
      {
        question: 'What is the term for three goals scored by a single player in a match?',
        options: ['Triple', 'Trick shot', 'Hat trick', 'Goal trio'],
        correctAnswer: 'Hat trick',
        category: 'sports'
      }
    ];
    
    
    // Example general knowledge questions
    const knowledgeQuestions = [
      {
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid', 'Rome'],
        correctAnswer: 'Paris',
        category: 'knowledge'
      },
      {
        question: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correctAnswer: 'William Shakespeare',
        category: 'knowledge'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        category: 'knowledge'
      },
      {
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 'Au',
        category: 'knowledge'
      },
      {
        question: 'Which of these is NOT a primary color?',
        options: ['Red', 'Blue', 'Yellow', 'Green'],
        correctAnswer: 'Green',
        category: 'knowledge'
      },
      {
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 'Pacific Ocean',
        category: 'knowledge'
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
        correctAnswer: 'Leonardo da Vinci',
        category: 'knowledge'
      },
      {
        question: 'What is the smallest prime number?',
        options: ['0', '1', '2', '3'],
        correctAnswer: '2',
        category: 'knowledge'
      },
      {
        question: 'Which country is known as the Land of the Rising Sun?',
        options: ['China', 'Japan', 'Thailand', 'South Korea'],
        correctAnswer: 'Japan',
        category: 'knowledge'
      },
      {
        question: 'What is the hardest natural substance on Earth?',
        options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
        correctAnswer: 'Diamond',
        category: 'knowledge'
      },
      {
        question: 'Who developed the theory of relativity?',
        options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Niels Bohr'],
        correctAnswer: 'Albert Einstein',
        category: 'knowledge'
      },
      {
        question: 'Which language is the most spoken worldwide?',
        options: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'],
        correctAnswer: 'Mandarin Chinese',
        category: 'knowledge'
      },
      {
        question: 'What is the tallest mountain in the world?',
        options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'],
        correctAnswer: 'Mount Everest',
        category: 'knowledge'
      },
      {
        question: 'In which year did the Titanic sink?',
        options: ['1910', '1912', '1914', '1916'],
        correctAnswer: '1912',
        category: 'knowledge'
      },
      {
        question: 'What is the main gas found in the air we breathe?',
        options: ['Oxygen', 'Hydrogen', 'Nitrogen', 'Carbon Dioxide'],
        correctAnswer: 'Nitrogen',
        category: 'knowledge'
      },
      {
        question: 'Who is known as the Father of Computers?',
        options: ['Alan Turing', 'Charles Babbage', 'Bill Gates', 'Steve Jobs'],
        correctAnswer: 'Charles Babbage',
        category: 'knowledge'
      },
      {
        question: 'What is the largest mammal in the world?',
        options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 'Blue Whale',
        category: 'knowledge'
      },
      {
        question: 'Which element has the chemical symbol "O"?',
        options: ['Gold', 'Oxygen', 'Osmium', 'Oxide'],
        correctAnswer: 'Oxygen',
        category: 'knowledge'
      },
      {
        question: 'What is the currency of Japan?',
        options: ['Yuan', 'Yen', 'Won', 'Dollar'],
        correctAnswer: 'Yen',
        category: 'knowledge'
      },
      {
        question: 'Who wrote the novel "1984"?',
        options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'J.K. Rowling'],
        correctAnswer: 'George Orwell',
        category: 'knowledge'
      },
      {
        question: 'Which planet is closest to the sun?',
        options: ['Venus', 'Earth', 'Mercury', 'Mars'],
        correctAnswer: 'Mercury',
        category: 'knowledge'
      },
      {
        question: 'What is the boiling point of water at sea level in Celsius?',
        options: ['90°C', '100°C', '110°C', '120°C'],
        correctAnswer: '100°C',
        category: 'knowledge'
      },
      {
        question: 'Who was the first person to walk on the Moon?',
        options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'],
        correctAnswer: 'Neil Armstrong',
        category: 'knowledge'
      },
      {
        question: 'What is the largest continent by area?',
        options: ['Africa', 'Asia', 'Europe', 'North America'],
        correctAnswer: 'Asia',
        category: 'knowledge'
      },
      {
        question: 'Which organ is responsible for pumping blood throughout the body?',
        options: ['Lungs', 'Liver', 'Heart', 'Kidneys'],
        correctAnswer: 'Heart',
        category: 'knowledge'
      },
      {
        question: 'What is the chemical symbol for sodium?',
        options: ['S', 'Na', 'Sn', 'So'],
        correctAnswer: 'Na',
        category: 'knowledge'
      },
      {
        question: 'Which country gifted the Statue of Liberty to the USA?',
        options: ['England', 'Germany', 'France', 'Spain'],
        correctAnswer: 'France',
        category: 'knowledge'
      },
      {
        question: 'What is the primary language spoken in Brazil?',
        options: ['Spanish', 'Portuguese', 'English', 'French'],
        correctAnswer: 'Portuguese',
        category: 'knowledge'
      },
      {
        question: 'Which planet has the most moons?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Saturn',
        category: 'knowledge'
      },
      {
        question: 'What is the square root of 64?',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        category: 'knowledge'
      },
      {
        question: 'Who painted the ceiling of the Sistine Chapel?',
        options: ['Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Donatello'],
        correctAnswer: 'Michelangelo',
        category: 'knowledge'
      },
      {
        question: 'Which gas do plants absorb from the atmosphere?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Carbon Dioxide',
        category: 'knowledge'
      },
      {
        question: 'What is the capital city of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 'Canberra',
        category: 'knowledge'
      },
      {
        question: 'Who discovered penicillin?',
        options: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Isaac Newton'],
        correctAnswer: 'Alexander Fleming',
        category: 'knowledge'
      },
      {
        question: 'Which planet is known for its rings?',
        options: ['Mars', 'Jupiter', 'Saturn', 'Uranus'],
        correctAnswer: 'Saturn',
        category: 'knowledge'
      },
      {
        question: 'What is the largest internal organ in the human body?',
        options: ['Heart', 'Liver', 'Lungs', 'Kidneys'],
        correctAnswer: 'Liver',
        category: 'knowledge'
      },
      {
        question: 'Which country is home to the Great Barrier Reef?',
        options: ['USA', 'Australia', 'South Africa', 'India'],
        correctAnswer: 'Australia',
        category: 'knowledge'
      },
      {
        question: 'What is the freezing point of water in Celsius?',
        options: ['0°C', '32°C', '100°C', '-10°C'],
        correctAnswer: '0°C',
        category: 'knowledge'
      },
      {
        question: 'Who is the author of "Pride and Prejudice"?',
        options: ['Charlotte Brontë', 'Emily Brontë', 'Jane Austen', 'Mary Shelley'],
        correctAnswer: 'Jane Austen',
        category: 'knowledge'
      },
      {
        question: 'What is the capital of Canada?',
        options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
        correctAnswer: 'Ottawa',
        category: 'knowledge'
      },
      {
        question: 'Which element has the atomic number 1?',
        options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],
        correctAnswer: 'Hydrogen',
        category: 'knowledge'
      },
      {
        question: 'What is the largest desert in the world?',
        options: ['Sahara', 'Gobi', 'Arctic', 'Antarctic'],
        correctAnswer: 'Antarctic',
        category: 'knowledge'
      }
    ];

    
    const historyQuestions = [
      {
        question: 'Who was the first president of the United States?',
        options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'],
        correctAnswer: 'George Washington',
        category: 'history'
      },
      {
        question: 'Which year did World War I begin?',
        options: ['1912', '1914', '1916', '1918'],
        correctAnswer: '1914',
        category: 'history'
      },
      {
        question: 'Who was the last pharaoh of ancient Egypt?',
        options: ['Cleopatra', 'Nefertiti', 'Ramesses II', 'Tutankhamun'],
        correctAnswer: 'Cleopatra',
        category: 'history'
      },
      {
        question: 'Which country was ruled by the Tsar before the Russian Revolution?',
        options: ['Germany', 'France', 'Russia', 'Austria'],
        correctAnswer: 'Russia',
        category: 'history'
      },
      {
        question: 'Who wrote the Communist Manifesto?',
        options: ['Karl Marx', 'Friedrich Engels', 'Vladimir Lenin', 'Joseph Stalin'],
        correctAnswer: 'Karl Marx',
        category: 'history'
      },
      {
        question: 'What year did the Titanic sink?',
        options: ['1910', '1912', '1914', '1920'],
        correctAnswer: '1912',
        category: 'history'
      },
      {
        question: 'Who was the leader of Nazi Germany?',
        options: ['Adolf Hitler', 'Joseph Goebbels', 'Hermann Göring', 'Heinrich Himmler'],
        correctAnswer: 'Adolf Hitler',
        category: 'history'
      },
      {
        question: 'Which empire was ruled by Genghis Khan?',
        options: ['Roman Empire', 'Ottoman Empire', 'Mongol Empire', 'Byzantine Empire'],
        correctAnswer: 'Mongol Empire',
        category: 'history'
      },
      {
        question: 'Which event started World War II?',
        options: ['Assassination of Archduke Franz Ferdinand', 'Invasion of Poland', 'Pearl Harbor attack', 'Fall of the Berlin Wall'],
        correctAnswer: 'Invasion of Poland',
        category: 'history'
      },
      {
        question: 'Who was the first female monarch of England?',
        options: ['Queen Elizabeth I', 'Queen Victoria', 'Mary I', 'Elizabeth II'],
        correctAnswer: 'Mary I',
        category: 'history'
      },
      {
        question: 'Who was the first emperor of China?',
        options: ['Qin Shi Huang', 'Han Wudi', 'Emperor Taizong', 'Li Shimin'],
        correctAnswer: 'Qin Shi Huang',
        category: 'history'
      },
      {
        question: 'In which year did the Berlin Wall fall?',
        options: ['1987', '1989', '1991', '1993'],
        correctAnswer: '1989',
        category: 'history'
      },
      {
        question: 'Which country was formerly known as Persia?',
        options: ['Iraq', 'Iran', 'Turkey', 'Afghanistan'],
        correctAnswer: 'Iran',
        category: 'history'
      },
      {
        question: 'Who was the first emperor of Rome?',
        options: ['Julius Caesar', 'Augustus', 'Tiberius', 'Nero'],
        correctAnswer: 'Augustus',
        category: 'history'
      },
      {
        question: 'What year did the American Civil War end?',
        options: ['1861', '1863', '1865', '1867'],
        correctAnswer: '1865',
        category: 'history'
      },
      {
        question: 'Which civilization built the pyramids in Egypt?',
        options: ['Sumerians', 'Romans', 'Ancient Egyptians', 'Greeks'],
        correctAnswer: 'Ancient Egyptians',
        category: 'history'
      },
      {
        question: 'Which country was known as the "Land of the Free" during the American Revolution?',
        options: ['France', 'United Kingdom', 'United States', 'Germany'],
        correctAnswer: 'United States',
        category: 'history'
      },
      {
        question: 'Who was the first African-American president of the United States?',
        options: ['George Washington', 'Abraham Lincoln', 'Barack Obama', 'Thomas Jefferson'],
        correctAnswer: 'Barack Obama',
        category: 'history'
      },
      {
        question: 'Who was the first man to walk on the moon?',
        options: ['Buzz Aldrin', 'Neil Armstrong', 'Michael Collins', 'Yuri Gagarin'],
        correctAnswer: 'Neil Armstrong',
        category: 'history'
      },
      {
        question: 'When did the Cold War officially end?',
        options: ['1989', '1991', '1993', '2000'],
        correctAnswer: '1991',
        category: 'history'
      },
      {
        question: 'Who was the first ruler of the Ottoman Empire?',
        options: ['Mehmed II', 'Suleiman the Magnificent', 'Osman I', 'Selim I'],
        correctAnswer: 'Osman I',
        category: 'history'
      },
      {
        question: 'Which war ended with the signing of the Treaty of Versailles?',
        options: ['World War I', 'World War II', 'Vietnam War', 'Korean War'],
        correctAnswer: 'World War I',
        category: 'history'
      },
      {
        question: 'Who was the first female prime minister of the United Kingdom?',
        options: ['Margaret Thatcher', 'Theresa May', 'Elizabeth II', 'Ellen Johnson Sirleaf'],
        correctAnswer: 'Margaret Thatcher',
        category: 'history'
      },
      {
        question: 'Which empire was ruled by Julius Caesar?',
        options: ['Roman Empire', 'Ottoman Empire', 'Mongol Empire', 'Greek Empire'],
        correctAnswer: 'Roman Empire',
        category: 'history'
      },
      {
        question: 'Who was the first man to sail around the world?',
        options: ['Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo', 'John Cabot'],
        correctAnswer: 'Ferdinand Magellan',
        category: 'history'
      },
      {
        question: 'What year was the Magna Carta signed?',
        options: ['1215', '1225', '1235', '1245'],
        correctAnswer: '1215',
        category: 'history'
      },
      {
        question: 'What was the primary goal of the Crusades?',
        options: ['Spread Christianity', 'Conquer the Middle East', 'Defend Europe from invaders', 'Control the trade routes'],
        correctAnswer: 'Spread Christianity',
        category: 'history'
      },
      {
        question: 'Which battle marked the turning point in the American Civil War?',
        options: ['Battle of Gettysburg', 'Battle of Antietam', 'Battle of Bunker Hill', 'Battle of Yorktown'],
        correctAnswer: 'Battle of Gettysburg',
        category: 'history'
      },
      {
        question: 'What was the name of the first permanent English colony in America?',
        options: ['Jamestown', 'Plymouth', 'Roanoke', 'Salem'],
        correctAnswer: 'Jamestown',
        category: 'history'
      },
      {
        question: 'Which king was famous for having six wives?',
        options: ['Richard the Lionheart', 'Henry VIII', 'Charles I', 'Edward I'],
        correctAnswer: 'Henry VIII',
        category: 'history'
      },
      {
        question: 'Who was the longest reigning monarch in British history?',
        options: ['Queen Elizabeth I', 'Queen Victoria', 'King George III', 'Queen Elizabeth II'],
        correctAnswer: 'Queen Elizabeth II',
        category: 'history'
      },
      {
        question: 'Which country was the first to grant women the right to vote?',
        options: ['New Zealand', 'United States', 'England', 'Finland'],
        correctAnswer: 'New Zealand',
        category: 'history'
      },
      {
        question: 'Who was the first African-American woman to refuse to give up her seat on a bus?',
        options: ['Rosa Parks', 'Harriet Tubman', 'Sojourner Truth', 'Maya Angelou'],
        correctAnswer: 'Rosa Parks',
        category: 'history'
      },
      {
        question: 'Which civilization is known for creating the first writing system?',
        options: ['Sumerians', 'Indus Valley', 'Egyptians', 'Greeks'],
        correctAnswer: 'Sumerians',
        category: 'history'
      },
      {
        question: 'Who was the first woman to fly solo across the Atlantic?',
        options: ['Amelia Earhart', 'Bessie Coleman', 'Eleanor Roosevelt', 'Harriet Quimby'],
        correctAnswer: 'Amelia Earhart',
        category: 'history'
      }
    ];

    const technologyQuestions = [
      {
        question: 'Who is the co-founder of Microsoft?',
        options: ['Bill Gates', 'Steve Jobs', 'Mark Zuckerberg', 'Larry Page'],
        correctAnswer: 'Bill Gates',
        category: 'technology'
      },
      {
        question: 'What does "HTTP" stand for?',
        options: ['Hypertext Transfer Protocol', 'Hypertext Transfer Process', 'Home Text Transfer Protocol', 'Hyper Transfer Text Protocol'],
        correctAnswer: 'Hypertext Transfer Protocol',
        category: 'technology'
      },
      {
        question: 'Which company created the iPhone?',
        options: ['Google', 'Apple', 'Samsung', 'Microsoft'],
        correctAnswer: 'Apple',
        category: 'technology'
      },
      {
        question: 'Which technology is used to make phone calls over the internet?',
        options: ['Bluetooth', 'Wi-Fi', 'VoIP', 'NFC'],
        correctAnswer: 'VoIP',
        category: 'technology'
      },
      {
        question: 'What was the first computer virus?',
        options: ['ILOVEYOU', 'Sasser', 'Morris Worm', 'Creeper'],
        correctAnswer: 'Creeper',
        category: 'technology'
      },
      {
        question: 'What does "Wi-Fi" stand for?',
        options: ['Wireless Fidelity', 'Wireless Function', 'World Interface', 'Wide Fidelity'],
        correctAnswer: 'Wireless Fidelity',
        category: 'technology'
      },
      {
        question: 'Who is known as the father of modern computing?',
        options: ['Charles Babbage', 'Alan Turing', 'John von Neumann', 'Bill Gates'],
        correctAnswer: 'Charles Babbage',
        category: 'technology'
      },
      {
        question: 'What year was the first iPhone released?',
        options: ['2005', '2007', '2008', '2010'],
        correctAnswer: '2007',
        category: 'technology'
      },
      {
        question: 'What programming language is primarily used for web development?',
        options: ['JavaScript', 'Python', 'C++', 'Java'],
        correctAnswer: 'JavaScript',
        category: 'technology'
      },
      {
        question: 'Which company developed the Android operating system?',
        options: ['Apple', 'Google', 'Microsoft', 'Samsung'],
        correctAnswer: 'Google',
        category: 'technology'
      },
      {
        question: 'Which technology is used to make virtual reality environments?',
        options: ['Artificial Intelligence', 'Augmented Reality', 'Holography', 'Virtual Reality'],
        correctAnswer: 'Virtual Reality',
        category: 'technology'
      },
      {
        question: 'What does "USB" stand for?',
        options: ['Universal Serial Bus', 'Universal Socket Bus', 'Universal Storage Bus', 'Unified Serial Bus'],
        correctAnswer: 'Universal Serial Bus',
        category: 'technology'
      },
      {
        question: 'Who invented the first practical telephone?',
        options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Michael Faraday'],
        correctAnswer: 'Alexander Graham Bell',
        category: 'technology'
      },
      {
        question: 'Which company was the first to build a personal computer?',
        options: ['IBM', 'Apple', 'Microsoft', 'Compaq'],
        correctAnswer: 'IBM',
        category: 'technology'
      },
      {
        question: 'What is the main function of a CPU in a computer?',
        options: ['To store data', 'To execute instructions', 'To display graphics', 'To input data'],
        correctAnswer: 'To execute instructions',
        category: 'technology'
      },
      {
        question: 'What does "GPU" stand for?',
        options: ['General Purpose Unit', 'Graphics Processing Unit', 'Global Processing Unit', 'General Processing Unit'],
        correctAnswer: 'Graphics Processing Unit',
        category: 'technology'
      },
      {
        question: 'What company acquired Instagram in 2012?',
        options: ['Google', 'Twitter', 'Facebook', 'Snapchat'],
        correctAnswer: 'Facebook',
        category: 'technology'
      },
      {
        question: 'What was the first video game console ever created?',
        options: ['Atari 2600', 'Magnavox Odyssey', 'Nintendo Entertainment System', 'Sega Genesis'],
        correctAnswer: 'Magnavox Odyssey',
        category: 'technology'
      },
      {
        question: 'What is the most common programming language for developing Android apps?',
        options: ['C++', 'Java', 'Swift', 'Ruby'],
        correctAnswer: 'Java',
        category: 'technology'
      },
      {
        question: 'What does the "cloud" refer to in technology?',
        options: ['A weather phenomenon', 'Remote servers for storing data', 'A new type of computer', 'A backup hard drive'],
        correctAnswer: 'Remote servers for storing data',
        category: 'technology'
      },
      {
        question: 'What year was the first computer virus detected?',
        options: ['1986', '1987', '1988', '1989'],
        correctAnswer: '1986',
        category: 'technology'
      },
      {
        question: 'Which tech company was founded by Larry Page and Sergey Brin?',
        options: ['Apple', 'Facebook', 'Google', 'Microsoft'],
        correctAnswer: 'Google',
        category: 'technology'
      }
    ];
    
    const scienceQuestions = [
      {
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'O2', 'CO2', 'NaCl'],
        correctAnswer: 'H2O',
        category: 'science'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctAnswer: 'Mars',
        category: 'science'
      },
      {
        question: 'What gas do plants absorb from the atmosphere?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Carbon Dioxide',
        category: 'science'
      },
      {
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
        correctAnswer: 'Mitochondria',
        category: 'science'
      },
      {
        question: 'What force keeps us grounded on Earth?',
        options: ['Magnetism', 'Friction', 'Gravity', 'Inertia'],
        correctAnswer: 'Gravity',
        category: 'science'
      },
      {
        question: 'What is the boiling point of water at sea level in Celsius?',
        options: ['90°C', '100°C', '110°C', '120°C'],
        correctAnswer: '100°C',
        category: 'science'
      },
      {
        question: 'Which organ is responsible for pumping blood throughout the body?',
        options: ['Lungs', 'Liver', 'Heart', 'Kidneys'],
        correctAnswer: 'Heart',
        category: 'science'
      },
      {
        question: 'What is the center of an atom called?',
        options: ['Electron', 'Proton', 'Neutron', 'Nucleus'],
        correctAnswer: 'Nucleus',
        category: 'science'
      },
      {
        question: 'Which part of the plant conducts photosynthesis?',
        options: ['Roots', 'Stem', 'Leaves', 'Flowers'],
        correctAnswer: 'Leaves',
        category: 'science'
      },
      {
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Jupiter',
        category: 'science'
      },
      {
        question: 'What is the process by which plants make their food?',
        options: ['Respiration', 'Digestion', 'Photosynthesis', 'Transpiration'],
        correctAnswer: 'Photosynthesis',
        category: 'science'
      },
      {
        question: 'Which gas is most abundant in the Earth’s atmosphere?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Nitrogen',
        category: 'science'
      },
      {
        question: 'What is the human body’s largest organ?',
        options: ['Heart', 'Liver', 'Skin', 'Lungs'],
        correctAnswer: 'Skin',
        category: 'science'
      },
      {
        question: 'What part of the cell contains genetic material?',
        options: ['Cytoplasm', 'Nucleus', 'Mitochondria', 'Ribosome'],
        correctAnswer: 'Nucleus',
        category: 'science'
      },
      {
        question: 'What is the speed of light?',
        options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
        correctAnswer: '300,000 km/s',
        category: 'science'
      },
      {
        question: 'Which vitamin is produced when a person is exposed to sunlight?',
        options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
        correctAnswer: 'Vitamin D',
        category: 'science'
      },
      {
        question: 'What is the main gas found in the air we breathe?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Nitrogen',
        category: 'science'
      },
      {
        question: 'Which planet is closest to the sun?',
        options: ['Venus', 'Earth', 'Mercury', 'Mars'],
        correctAnswer: 'Mercury',
        category: 'science'
      },
      {
        question: 'What is the freezing point of water in Celsius?',
        options: ['0°C', '32°C', '100°C', '-10°C'],
        correctAnswer: '0°C',
        category: 'science'
      },
      {
        question: 'What is the most abundant element in the universe?',
        options: ['Oxygen', 'Hydrogen', 'Carbon', 'Helium'],
        correctAnswer: 'Hydrogen',
        category: 'science'
      },
      {
        question: 'Which part of the human body is responsible for filtering blood?',
        options: ['Liver', 'Heart', 'Kidneys', 'Lungs'],
        correctAnswer: 'Kidneys',
        category: 'science'
      },
      {
        question: 'What is the primary function of red blood cells?',
        options: ['Fight infections', 'Carry oxygen', 'Clot blood', 'Produce hormones'],
        correctAnswer: 'Carry oxygen',
        category: 'science'
      },
      {
        question: 'Which gas do animals exhale during respiration?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Carbon Dioxide',
        category: 'science'
      },
      {
        question: 'What is the basic unit of life?',
        options: ['Atom', 'Molecule', 'Cell', 'Organ'],
        correctAnswer: 'Cell',
        category: 'science'
      },
      {
        question: 'Which organ is primarily responsible for detoxifying chemicals and metabolizing drugs?',
        options: ['Heart', 'Liver', 'Kidneys', 'Lungs'],
        correctAnswer: 'Liver',
        category: 'science'
      },
      {
        question: 'What is the term for animals that eat only plants?',
        options: ['Carnivores', 'Herbivores', 'Omnivores', 'Insectivores'],
        correctAnswer: 'Herbivores',
        category: 'science'
      },
      {
        question: 'What is the process of liquid water turning into vapor called?',
        options: ['Condensation', 'Precipitation', 'Evaporation', 'Sublimation'],
        correctAnswer: 'Evaporation',
        category: 'science'
      },
      {
        question: 'Which planet is known for its prominent ring system?',
        options: ['Mars', 'Jupiter', 'Saturn', 'Uranus'],
        correctAnswer: 'Saturn',
        category: 'science'
      },
      {
        question: 'What is the term for a change in an organism’s DNA sequence?',
        options: ['Mutation', 'Replication', 'Transcription', 'Translation'],
        correctAnswer: 'Mutation',
        category: 'science'
      },
      {
        question: 'Which blood type is known as the universal donor?',
        options: ['A', 'B', 'AB', 'O negative'],
        correctAnswer: 'O negative',
        category: 'science'
      },
      {
        question: 'What is the main function of white blood cells?',
        options: ['Carry oxygen', 'Clot blood', 'Fight infections', 'Produce hormones'],
        correctAnswer: 'Fight infections',
        category: 'science'
      },
      {
        question: 'Which part of the brain controls balance and coordination?',
        options: ['Cerebrum', 'Cerebellum', 'Medulla', 'Hypothalamus'],
        correctAnswer: 'Cerebellum',
        category: 'science'
      },
      {
        question: 'What is the term for animals that maintain a constant body temperature?',
        options: ['Cold-blooded', 'Warm-blooded', 'Ectothermic', 'Invertebrates'],
        correctAnswer: 'Warm-blooded',
        category: 'science'
      },
      {
        question: 'Which organ is responsible for producing insulin?',
        options: ['Liver', 'Pancreas', 'Kidneys', 'Stomach'],
        correctAnswer: 'Pancreas',
        category: 'science'
      },
      {
        question: 'What is the term for the smallest unit of a chemical element?',
        options: ['Molecule', 'Atom', 'Compound', 'Ion'],
        correctAnswer: 'Atom',
        category: 'science'
      },
      {
        question: 'Which planet is known for its Great Red Spot?',
        options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
        correctAnswer: 'Jupiter',
        category: 'science'
      },
      {
        question: 'What is the term for the study of earthquakes?',
        options: ['Meteorology', 'Seismology', 'Volcanology', 'Geology'],
        correctAnswer: 'Seismology',
        category: 'science'
      },
      {
        question: 'Which element has the chemical symbol "O"?',
        options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
        correctAnswer: 'Oxygen',
        category: 'science'
      },
      {
        question: 'What is the term for the amount of matter in an object?',
        options: ['Weight', 'Volume', 'Density', 'Mass'],
        correctAnswer: 'Mass',
        category: 'science'
      },
      {
        question: 'Which organ is responsible for hearing and balance?',
        options: ['Eye', 'Nose', 'Ear', 'Tongue'],
        correctAnswer: 'Ear',
        category: 'science'
      }
    ];
    
    const geographyQuestions = [
      {
        question: 'What is the capital of Canada?',
        options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
        correctAnswer: 'Ottawa',
        category: 'geography'
      },
      {
        question: 'Which river is the longest in the world?',
        options: ['Amazon', 'Yangtze', 'Mississippi', 'Nile'],
        correctAnswer: 'Nile',
        category: 'geography'
      },
      {
        question: 'Which country has the largest land area?',
        options: ['China', 'USA', 'Russia', 'Canada'],
        correctAnswer: 'Russia',
        category: 'geography'
      },
      {
        question: 'What is the smallest country in the world by area?',
        options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
        correctAnswer: 'Vatican City',
        category: 'geography'
      },
      {
        question: 'Which desert is the largest in the world?',
        options: ['Sahara', 'Gobi', 'Kalahari', 'Antarctic Desert'],
        correctAnswer: 'Antarctic Desert',
        category: 'geography'
      },
      {
        question: 'Which continent has the most countries?',
        options: ['Asia', 'Africa', 'Europe', 'South America'],
        correctAnswer: 'Africa',
        category: 'geography'
      },
      {
        question: 'What is the capital city of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 'Canberra',
        category: 'geography'
      },
      {
        question: 'Which ocean is the largest by surface area?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctAnswer: 'Pacific',
        category: 'geography'
      },
      {
        question: 'Which country has the most natural lakes?',
        options: ['USA', 'Canada', 'Russia', 'Brazil'],
        correctAnswer: 'Canada',
        category: 'geography'
      },
      {
        question: 'What is the longest mountain range in the world?',
        options: ['Rocky Mountains', 'Andes', 'Himalayas', 'Alps'],
        correctAnswer: 'Andes',
        category: 'geography'
      },
      {
        question: 'Which country is both in Europe and Asia?',
        options: ['Egypt', 'Turkey', 'Spain', 'India'],
        correctAnswer: 'Turkey',
        category: 'geography'
      },
      {
        question: 'What is the most populous city in the world?',
        options: ['New York', 'Shanghai', 'Tokyo', 'Delhi'],
        correctAnswer: 'Tokyo',
        category: 'geography'
      },
      {
        question: 'Which African country has the largest population?',
        options: ['Egypt', 'South Africa', 'Nigeria', 'Ethiopia'],
        correctAnswer: 'Nigeria',
        category: 'geography'
      },
      {
        question: 'Which European country has the longest coastline?',
        options: ['Italy', 'Greece', 'Norway', 'Spain'],
        correctAnswer: 'Norway',
        category: 'geography'
      },
      {
        question: 'What is the highest mountain in the world?',
        options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'],
        correctAnswer: 'Mount Everest',
        category: 'geography'
      },
      {
        question: 'Where is the Eiffel Tower located?',
        options: ['London', 'Berlin', 'Paris', 'Rome'],
        correctAnswer: 'Paris',
        category: 'geography'
      },
      {
        question: 'What is the name of the famous clock tower in London?',
        options: ['Big Ben', 'Clock Tower', 'London Eye', 'Tower Bridge'],
        correctAnswer: 'Big Ben',
        category: 'geography'
      },
      {
        question: 'Which country is home to the ancient ruins of Machu Picchu?',
        options: ['Mexico', 'Peru', 'Chile', 'Brazil'],
        correctAnswer: 'Peru',
        category: 'geography'
      },
      {
        question: 'In which city would you find the Colosseum?',
        options: ['Athens', 'Rome', 'Istanbul', 'Paris'],
        correctAnswer: 'Rome',
        category: 'geography'
      },
      {
        question: 'Which landmark in Egypt is known for its lion’s body and human head?',
        options: ['The Great Pyramid', 'The Sphinx', 'Luxor Temple', 'Abu Simbel'],
        correctAnswer: 'The Sphinx',
        category: 'geography'
      },
      {
        question: 'Where can you find the famous Hollywood Sign?',
        options: ['New York', 'Los Angeles', 'San Francisco', 'Las Vegas'],
        correctAnswer: 'Los Angeles',
        category: 'geography'
      },
      {
        question: 'The Leaning Tower of Pisa is found in which country?',
        options: ['France', 'Italy', 'Spain', 'Greece'],
        correctAnswer: 'Italy',
        category: 'geography'
      },
      {
        question: 'Which landmark in New York City was a gift from France?',
        options: ['Empire State Building', 'Statue of Liberty', 'Brooklyn Bridge', 'Central Park'],
        correctAnswer: 'Statue of Liberty',
        category: 'geography'
      },
      {
        question: 'Which river runs through the Grand Canyon?',
        options: ['Mississippi', 'Colorado', 'Rio Grande', 'Missouri'],
        correctAnswer: 'Colorado',
        category: 'geography'
      },
      {
        question: 'What is the world’s deepest ocean trench?',
        options: ['Tonga Trench', 'Kuril–Kamchatka Trench', 'Mariana Trench', 'Philippine Trench'],
        correctAnswer: 'Mariana Trench',
        category: 'geography'
      },
      {
        question: 'What is the highest waterfall in the world?',
        options: ['Niagara Falls', 'Angel Falls', 'Victoria Falls', 'Yosemite Falls'],
        correctAnswer: 'Angel Falls',
        category: 'geography'
      },
      {
        question: 'Which lake is the largest by surface area in the world?',
        options: ['Lake Superior', 'Lake Victoria', 'Caspian Sea', 'Lake Michigan'],
        correctAnswer: 'Caspian Sea',
        category: 'geography'
      },
      {
        question: 'What is the largest coral reef system in the world?',
        options: ['Belize Barrier Reef', 'New Caledonian Barrier Reef', 'Great Barrier Reef', 'Red Sea Coral Reef'],
        correctAnswer: 'Great Barrier Reef',
        category: 'geography'
      },
      {
        question: 'What is the name of the largest hot desert in the world (excluding polar deserts)?',
        options: ['Gobi Desert', 'Kalahari Desert', 'Sahara Desert', 'Thar Desert'],
        correctAnswer: 'Sahara Desert',
        category: 'geography'
      },
      {
        question: 'Which river is the largest by volume of water discharged?',
        options: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'],
        correctAnswer: 'Amazon',
        category: 'geography'
      },
      {
        question: 'In which country can you find Mount Kilimanjaro?',
        options: ['Kenya', 'Uganda', 'Tanzania', 'Ethiopia'],
        correctAnswer: 'Tanzania',
        category: 'geography'
      },
      {
        question: 'What is the name of the world’s largest salt flat?',
        options: ['Bonneville Salt Flats', 'Salar de Uyuni', 'Etosha Pan', 'Makgadikgadi Pan'],
        correctAnswer: 'Salar de Uyuni',
        category: 'geography'
      },
      {
        question: 'Which lake is the largest freshwater lake by volume and deepest in the world?',
        options: ['Lake Superior', 'Lake Baikal', 'Lake Tanganyika', 'Lake Victoria'],
        correctAnswer: 'Lake Baikal',
        category: 'geography'
      },
      {
        question: 'What is the tallest mountain in North America?',
        options: ['Mount Logan', 'Mount Saint Elias', 'Denali', 'Pico de Orizaba'],
        correctAnswer: 'Denali',
        category: 'geography'
      },
      {
        question: 'Which is the second-largest ocean in the world?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Southern Ocean', 'Arctic Ocean'],
        correctAnswer: 'Atlantic Ocean',
        category: 'geography'
      },
      {
        question: 'What is the name of the large sandstone rock formation in central Australia?',
        options: ['Uluru', 'Kata Tjuta', 'Devils Marbles', 'Wave Rock'],
        correctAnswer: 'Uluru',
        category: 'geography'
      },
      {
        question: 'Which body of water separates Saudi Arabia from northeastern Africa?',
        options: ['Red Sea', 'Persian Gulf', 'Arabian Sea', 'Mediterranean Sea'],
        correctAnswer: 'Red Sea',
        category: 'geography'
      },
      {
        question: 'Which island is the largest in the world by land area?',
        options: ['Greenland', 'New Guinea', 'Borneo', 'Madagascar'],
        correctAnswer: 'Greenland',
        category: 'geography'
      },
      {
        question: 'Which natural landmark is known as the world’s largest subtropical wilderness?',
        options: ['Amazon Rainforest', 'Everglades', 'Congo Basin', 'Daintree Rainforest'],
        correctAnswer: 'Everglades',
        category: 'geography'
      },
      {
        question: 'The Victoria Falls are located on the border of which two countries?',
        options: ['Zambia and Zimbabwe', 'South Africa and Botswana', 'Namibia and Angola', 'Mozambique and Malawi'],
        correctAnswer: 'Zambia and Zimbabwe',
        category: 'geography'
      },
      {
        question: 'Which ocean is the warmest?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Southern Ocean'],
        correctAnswer: 'Indian Ocean',
        category: 'geography'
      }
    ];
    

    
    // Combine all questions
    const allQuestions = [
      ...animeQuestions,
      ...moviesQuestions,
      ...sportsQuestions,
      ...knowledgeQuestions,
      ...historyQuestions,
      ...technologyQuestions,
      ...scienceQuestions,
      ...geographyQuestions,
    ];
    
    // Clear existing questions
    await Question.deleteMany({});
    
    // Insert new questions
    await Question.insertMany(allQuestions);
    
    res.status(201).json({ 
      message: 'Sample questions seeded successfully',
      count: allQuestions.length
    });
  } catch (err) {
    console.error('Error seeding questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;