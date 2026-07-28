const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Handle Render's path
const BASE_DIR = process.env.RENDER ? '/opt/render/project/src' : __dirname;
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const DATA_FILE = path.join(BASE_DIR, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Load/Save data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: [], quizzes: getQuizzes() };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getQuizzes() {
  return [
    { id: 'personality', title: 'What Kind of Person Are You?', emoji: '🔮', plays: 12843 },
    { id: 'morning', title: 'Are You a Morning Person?', emoji: '☀️', plays: 8972 },
    { id: 'love', title: "What's Your Love Language?", emoji: '💕', plays: 15234 },
    { id: 'social', title: 'Introvert or Extrovert?', emoji: '🫂', plays: 18923 },
    { id: 'food', title: "What's Your Food Personality?", emoji: '🍕', plays: 7654 },
    { id: 'stress', title: 'How Do You Handle Stress?', emoji: '🧘', plays: 6543 }
  ];
}

function getQuestions(quizId) {
  const questions = {
    personality: [
      { text: 'How do you prefer to spend your weekend?', options: ['Exploring new places', 'Relaxing at home', 'Hanging with friends', 'Working on projects'] },
      { text: 'When making a decision, you rely on...', options: ['Your gut feeling', 'Careful analysis', 'What others think', 'Logic and facts'] },
      { text: 'Your ideal morning starts with...', options: ['Meditation', 'High-energy workout', 'Checking social media', 'A big breakfast'] },
      { text: 'How do you handle unexpected problems?', options: ['Adapt quickly', 'Overthink solutions', 'Ask for help', 'Ignore them'] },
      { text: 'What motivates you most?', options: ['Personal growth', 'Recognition', 'Helping others', 'Achievement'] }
    ],
    morning: [
      { text: 'Alarm goes off at 5 AM. First thought?', options: ['Yes! Time to crush it!', 'Hit snooze 5 times', 'I hate mornings', 'Depends on the day'] },
      { text: "What's your ideal breakfast?", options: ['Full English', 'Just coffee', 'Something healthy', 'I skip breakfast'] },
      { text: 'How do you feel after waking up?', options: ['Energized!', 'Groggy', 'Anxious', 'Ready to go'] },
      { text: 'Best time for productive work?', options: ['Early morning', 'Midday', 'Late night', 'No pattern'] },
      { text: 'Morning non-negotiable?', options: ['Exercise', 'Coffee first', 'Check phone', 'Quiet time'] }
    ],
    love: [
      { text: 'Partner surprises you with flowers. You feel...', options: ['So loved!', 'Happy but awkward', 'Wished they helped instead', 'Want quality time'] },
      { text: 'How do you show friends you care?', options: ['Gifts', 'Kind words', 'Helping out', 'Spending time together'] },
      { text: "What's more meaningful?", options: ['Thoughtful gift', '"I love you"', 'Helps with chores', 'Movie night together'] },
      { text: 'After a long day, you want...', options: ['A relaxing surprise', 'Someone to listen', 'Help with tasks', 'Quality time'] },
      { text: 'Love language for yourself?', options: ['Spoil myself', 'Positive affirmations', 'Self-care tasks', 'Alone time'] }
    ],
    social: [
      { text: 'After socializing all week, you need...', options: ['Solo time to recharge', 'More social plans!', 'Small group activities', 'Depends on the people'] },
      { text: 'At a party, you typically...', options: ['Find a quiet corner', 'Work the room', 'Stick with close friends', 'Leave early'] },
      { text: 'Your ideal Friday night?', options: ['Home alone', 'Big night out', 'Small dinner party', 'Whatever feels right'] },
      { text: 'How do you make decisions?', options: ['Think internally', 'Discuss with others', 'Consider everyone', 'Go with the flow'] },
      { text: 'When you meet new people...', options: ['Observe first', 'Dive right in', 'Warm up gradually', 'Could go either way'] }
    ],
    food: [
      { text: 'Cooking dinner for yourself?', options: ['Gourmet creation', 'Order takeout', 'Simple but healthy', "Whatever's quick"] },
      { text: "Your favorite cuisine?", options: ['Italian', 'Japanese', 'Mexican', 'Comfort food'] },
      { text: 'Eating alone at a restaurant...', options: ['Perfect peace', 'Bring a book', 'Skip it', 'People watch'] },
      { text: 'Food is more about...', options: ['Flavor explosion', 'Health fuel', 'Cultural experience', 'Nostalgia'] },
      { text: "Your go-to comfort food?", options: ['Mac and cheese', 'Sushi', 'Tacos', "Mom's cooking"] }
    ],
    stress: [
      { text: 'Deadline tomorrow, project nowhere near done. You...', options: 
