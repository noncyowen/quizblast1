const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load/Save data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: [], quizzes: getQuizzes(), notifications: [] };
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
      { text: 'Deadline tomorrow, project nowhere near done. You...', options: ['Pull an all-nighter', 'Panic', 'Ask for help', 'Prioritize ruthlessly'] },
      { text: 'When stressed, you typically...', options: ['Exercise it out', 'Talk to someone', 'Bury yourself in work', 'Avoid thinking about it'] },
      { text: 'Your go-to stress relief?', options: ['Gym or running', 'Chat with friend', 'Deep breathing', 'Distraction'] },
      { text: 'How do friends describe you under pressure?', options: ['Calm operator', 'Honest about stress', 'Gets things done', 'Needs space'] },
      { text: 'What stressed you out recently?', options: ['Work pressure', 'Relationship stuff', 'Life uncertainty', 'Daily hassles'] }
    ]
  };
  return questions[quizId] || questions.personality;
}

// Routes
app.post('/api/auth/login', (req, res) => {
  const { phone, referralCode } = req.body;
  const data = loadData();
  
  let user = data.users.find(u => u.phone === phone);
  
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      phone,
      points: 0,
      lifetimePoints: 0,
      referrals: 0,
      referralCode: 'QB' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      quizzesCompleted: 0,
      adsWatched: 0,
      streak: 1,
      createdAt: new Date().toISOString(),
      totalWithdrawn: 0
    };
    data.users.push(user);
    saveData(data);
  }
  
  res.json({ user });
});

app.get('/api/quizzes', (req, res) => {
  const data = loadData();
  res.json(data.quizzes);
});

app.get('/api/quiz/:id/questions', (req, res) => {
  res.json(getQuestions(req.params.id));
});

app.post('/api/quizzes/:id/complete', (req, res) => {
  const userId = req.headers['x-user-id'];
  const data = loadData();
  const user = data.users.find(u => u.id === userId);
  
  if (user) {
    user.points += 100;
    user.lifetimePoints += 100;
    user.quizzesCompleted++;
    saveData(data);
  }
  
  res.json({ points: 100, totalPoints: user?.points || 0 });
});

app.post('/api/points/watch-ad', (req, res) => {
  const userId = req.headers['x-user-id'];
  const data = loadData();
  const user = data.users.find(u => u.id === userId);
  const points = 10 + Math.floor(Math.random() * 41);
  
  if (user) {
    user.points += points;
    user.lifetimePoints += points;
    user.adsWatched++;
    saveData(data);
  }
  
  res.json({ points, totalPoints: user?.points || 0 });
});

app.get('/api/leaderboard', (req, res) => {
  const data = loadData();
  const top = data.users
    .sort((a, b) => b.lifetimePoints - a.lifetimePoints)
    .slice(0, 10)
    .map((u, i) => ({
      rank: i + 1,
      name: u.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
      points: u.lifetimePoints
    }));
  res.json(top);
});

app.get('/api/notifications', (req, res) => {
  const names = ['Sarah', 'Mike', 'Emma', 'James', 'Lisa', 'Tom'];
  const messages = names.map(n => `${n} just earned 500 points! 🎉`);
  res.json(messages.map((message, i) => ({ message })));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`QuizBlast running on port ${PORT}`);
});
