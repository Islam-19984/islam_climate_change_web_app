const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Database setup
mongoose.connect('mongodb://localhost/climate-change-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// Petition schema and model
const petitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  signatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
const Petition = mongoose.model('Petition', petitionSchema);

// Representative schema and model
const representativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});
const Representative = mongoose.model('Representative', representativeSchema);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Peer-to-peer chat functionality with Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// User registration
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Petition signing
app.post('/api/petitions/sign', async (req, res) => {
  const { petitionId, userId } = req.body;

  try {
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    petition.signatures.push(userId);
    await petition.save();
    res.status(200).json({ message: 'Petition signed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Letter sending
app.post('/api/letters/send', async (req, res) => {
  const { representativeId, message } = req.body;

  try {
    const representative = await Representative.findById(representativeId);
    if (!representative) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    // Send the email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: representative.email,
      subject: 'Climate Change Advocacy Letter',
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Letter sent successfully' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quiz submission and points update
app.post('/api/quizzes/submit', async (req, res) => {
  const { answers, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const correctAnswers = ['c', 'c']; // Assuming 'c' is the correct answer for both questions
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        score++;
      }
    });

    user.points += score;
    await user.save();

    res.status(200).json({ score, points: user.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});