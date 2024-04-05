import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send registration or login request to the server
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('chat message', newMessage);
      setNewMessage('');
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    const answers = Array.from(e.target.elements)
      .filter((element) => element.type === 'radio' && element.checked)
      .map((element) => element.value);

    try {
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      setPoints(data.points);
      alert(`You scored ${data.score} out of 2`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <header>
        <nav id="navbar">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#education">Education</a></li>
            <li><a href="#advocacy">Advocacy</a></li>
            <li><a href="#community">Community</a></li>
            <li><a href="#register">Register</a></li>
            <li><a href="#login">Login</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section id="register">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="register-username">Username:</label>
            <input
              type="text"
              id="register-username"
              name="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="register-email">Email:</label>
            <input
              type="email"
              id="register-email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="register-password">Password:</label>
            <input
              type="password"
              id="register-password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Register</button>
          </form>
        </section>

        {/* Other sections */}

        <section id="community">
          <div id="peer-support">
            <h3>Connect with Peers</h3>
            <p>Engage in discussions, share experiences, and offer support to fellow community members.</p>
            <ul>
              {messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
            <form onSubmit={handleMessageSubmit}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </section>

        <section id="interactive-quiz">
          <div id="quizzes">
            <h3>Interactive Quizzes</h3>
            <p>Test your knowledge about climate change.</p>
            <form onSubmit={handleQuizSubmit}>
              <label>1. What is the primary cause of recent global warming?</label>
              <br />
              <input type="radio" id="q1a1" name="q1" value="a" />
              <label htmlFor="q1a1">A. Solar Variability</label>
              <br />
              <input type="radio" id="q1a2" name="q1" value="b" />
              <label htmlFor="q1a2">B. Natural Cycles</label>
              <br />
              <input type="radio" id="q1a3" name="q1" value="c" />
              <label htmlFor="q1a3">C. Human activities</label>
              <br />

              <label>2. Which gas is the most significant greenhouse gas contributing to human-induced climate change?</label>
              <br />
              <input type="radio" id="q2a1" name="q2" value="a" />
              <label htmlFor="q2a1">A. Methane</label>
              <br />
              <input type="radio" id="q2a2" name="q2" value="b" />
              <label htmlFor="q2a2">B. Nitrous Oxide</label>
              <br />
              <input type="radio" id="q2a3" name="q2" value="c" />
              <label htmlFor="q2a3">C. Carbon Dioxide</label>
              <br />
              <button type="submit">Submit Answers</button>
            </form>
          </div>
        </section>

        <section id="earnings-points">
          <h2>Your Earnings Points</h2>
          <p>You have earned <span id="points-value">{points}</span> points.</p>
          <p>Earn points by engaging with our platform and achieving various milestones.</p>
          <ul>
            <li>0-2 points: Beginner</li>
            <li>3-5 points: Advanced</li>
          </ul>
        </section>
      </main>
      <footer>
        <p>&copy; 2024 Climate Change Advocate Web App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;