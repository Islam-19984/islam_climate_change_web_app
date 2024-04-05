document.addEventListener('DOMContentLoaded', function () {
  // Form submission handling for registration, login, and new project forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', handleFormSubmission);
  });

  function handleFormSubmission(event) {
    event.preventDefault(); // Prevent actual submission
    const formId = event.target.id;
    if (formId === 'new-project-form') {
      alert('Project submission received. Thank you!');
    } else if (formId === 'register-form') {
      const username = document.querySelector('#register-username').value;
      const email = document.querySelector('#register-email').value;
      alert(`Registration successful for username: ${username} with email: ${email}`);
    } else if (formId === 'login-form') {
      const username = document.querySelector('#login-username').value;
      alert(`Login successful for username: ${username}`);
    } else {
      alert('Form submitted. Thank you!');
    }
  }

  // Interactive quiz handling
  const quizForm = document.querySelector('#quizzes form');
  if (quizForm) {
    quizForm.addEventListener('submit', handleQuizSubmission);
  }

  function handleQuizSubmission(event) {
    event.preventDefault();
    let score = 0;
    const correctAnswers = ['c', 'c']; // Assuming 'c' is the correct answer for both questions
    correctAnswers.forEach((correctAnswer, index) => {
      const questionName = `q${index + 1}`;
      const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);
      if (selectedAnswer && selectedAnswer.value === correctAnswer) {
        score++;
      }
    });
    updatePoints(score);
    alert(`You scored ${score} out of ${correctAnswers.length}`);
  }

  // Points update function
  function updatePoints(pointsEarned) {
    const pointsValueElement = document.getElementById('points-value');
    let currentPoints = parseInt(pointsValueElement.textContent, 10);
    currentPoints += pointsEarned;
    pointsValueElement.textContent = currentPoints;

    // Update user level based on points
    let levelMessage = 'Beginner';
    if (currentPoints >= 3 && currentPoints <= 5) {
      levelMessage = 'Advanced';
    }
    alert(`You are now at ${levelMessage} level with ${currentPoints} points.`);
  }

  // Highlight active section in navbar based on scroll position
  window.addEventListener('scroll', highlightNavbarSection);

  function highlightNavbarSection() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#navbar a');

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(currentSection)) {
        link.classList.add('active');
      }
    });
  }
});