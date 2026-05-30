let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

function initExamModule() {
  document.getElementById('btn-start-exam').onclick = startExam;
  
  // Load question bank from local assets
  loadQuestionBank();
}

async function loadQuestionBank() {
  try {
    const response = await fetch('assets/data/study_bank.json');
    questions = await response.json();
    
    // Update loaded count on dashboard
    document.querySelector('.metric h4').textContent = questions.length;
    
    const savedHighScore = localStorage.getItem('pico_exam_highscore') || '0';
    document.getElementById('exam-score-val').textContent = `${savedHighScore} / ${questions.length}`;
  } catch (err) {
    console.error('Failed to load study bank questions:', err);
  }
}

function startExam() {
  if (questions.length === 0) return;
  
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  document.getElementById('exam-dashboard').style.display = 'none';
  document.getElementById('exam-active-test').style.display = 'block';
  
  showQuestion(0);
  speakOutLoud("Starting preparatory mock exam. Good luck, Varshan! You've got this!");
}

function showQuestion(index) {
  const q = questions[index];
  
  document.getElementById('exam-subject-tag').textContent = q.subject;
  document.getElementById('exam-topic-tag').textContent = q.topic;
  document.getElementById('exam-question-counter').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('exam-question-body').textContent = q.question;
  
  const optionsContainer = document.getElementById('exam-options-container');
  optionsContainer.innerHTML = '';
  
  document.getElementById('exam-explanation-box').style.display = 'none';
  document.getElementById('btn-exam-next').style.display = 'none';
  
  q.options.forEach((opt, idx) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = opt;
    button.onclick = () => selectOption(idx);
    optionsContainer.appendChild(button);
  });
}

function selectOption(selectedIdx) {
  const q = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-btn');
  
  // Disable further clicks
  buttons.forEach(btn => btn.disabled = true);
  
  const isCorrect = selectedIdx === q.answer;
  if (isCorrect) {
    score++;
    buttons[selectedIdx].classList.add('correct');
    document.getElementById('explanation-title').textContent = "✅ Correct Response!";
    document.getElementById('explanation-title').style.color = "#10b981";
    
    stats.intellect = Math.min(100, stats.intellect + 4);
    stats.affection = Math.min(100, stats.affection + 2);
  } else {
    buttons[selectedIdx].classList.add('wrong');
    buttons[q.answer].classList.add('correct');
    document.getElementById('explanation-title').textContent = "❌ Incorrect Response";
    document.getElementById('explanation-title').style.color = "#ef4444";
    
    stats.energy = Math.max(0, stats.energy - 3);
  }
  
  saveStats();

  // Show explanation details
  document.getElementById('explanation-text').textContent = q.explanation;
  document.getElementById('exam-explanation-box').style.display = 'block';
  
  // Toggle transition buttons
  const nextBtn = document.getElementById('btn-exam-next');
  nextBtn.style.display = 'block';
  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.textContent = "FINISH EXAM 🏁";
  } else {
    nextBtn.textContent = "NEXT QUESTION ➔";
  }
  nextBtn.onclick = transitionNext;
}

function transitionNext() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex >= questions.length) {
    finishExam();
  } else {
    showQuestion(currentQuestionIndex);
  }
}

function finishExam() {
  document.getElementById('exam-active-test').style.display = 'none';
  document.getElementById('exam-dashboard').style.display = 'block';
  
  const high = localStorage.getItem('pico_exam_highscore') || '0';
  if (score > parseInt(high, 10)) {
    localStorage.setItem('pico_exam_highscore', score.toString());
  }
  
  // Boost solved questions count globally
  solvedQuestionsCount += score;
  saveStats();
  
  document.getElementById('exam-score-val').textContent = `${localStorage.getItem('pico_exam_highscore')} / ${questions.length}`;

  const feedbackText = `Exam completed, Varshan! You scored ${score} out of ${questions.length} correct. Excellent practice study block!`;
  speakOutLoud(feedbackText);
}
