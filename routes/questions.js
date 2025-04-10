// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Category = require('../models/Category');

// Get all categories
router.get('/categories', async (req, res) => {
  try {
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
        options: ['Akuma', 'Homunculi', 'Titans', 'Hollows', 'Demons'],
        correctAnswer: 'Titans',
        category: 'anime'
      },
      // Add more anime questions...
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
      // Add more movies questions...
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
      // Add more sports questions...
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
      // Add more general knowledge questions...
    ];
    
    // Combine all questions
    const allQuestions = [
      ...animeQuestions,
      ...moviesQuestions,
      ...sportsQuestions,
      ...knowledgeQuestions
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