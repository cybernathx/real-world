let examState = {
  subjectId: null,
  subjectName: '',
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  elapsedSeconds: 0,
  totalDurationSeconds: 30 * 60, // 30 minutes configurable
  completed: false,
  timerId: null
};

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getRemainingTime() {
  return examState.totalDurationSeconds - examState.elapsedSeconds;
}

function getOptionLetter(optionKey) {
  return optionKey.toUpperCase().replace('OPTION_', '');
}

function getAnsweredCount() {
  return Object.keys(examState.answers).length;
}

function isQuestionAnswered(questionId) {
  return examState.answers[questionId] !== undefined;
}

async function loadExam() {
  if (!CBT.requireAuth()) return;

  const subjectId = getQueryParam('subjectId');
  if (!subjectId) {
    window.location.href = 'subjects.html';
    return;
  }

  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      headers: CBT.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Unable to load subject');
    }

    const subjectData = await response.json();
    examState.subjectId = Number(subjectId);
    examState.subjectName = subjectData.subject.name;
    renderExamHeader();
    await fetchQuestions(subjectId);
  } catch (error) {
    console.error(error);
    alert(error.message || 'Unable to start exam');
    window.location.href = 'subjects.html';
  }
}

async function fetchQuestions(subjectId) {
  const response = await fetch(`/api/questions?subjectId=${subjectId}&random=true&limit=10&includeAnswer=true`, {
    headers: CBT.getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to retrieve questions');
  }
  const data = await response.json();
  examState.questions = data.questions || [];
  examState.startTime = Date.now();
  examState.elapsedSeconds = 0;
  
  if (!examState.questions.length) {
    document.querySelector('#examQuestion').innerHTML = '<div class="card"><p>No questions are available for this subject yet.</p></div>';
    return;
  }

  // Initialize UI with question count
  document.querySelector('#totalQuestions').textContent = examState.questions.length;
  document.querySelector('#answeredCount').textContent = `0/${examState.questions.length} answered`;
  
  renderQuestion();
  renderQuestionNavigation();
  startTimer();
}

function renderExamHeader() {
  document.querySelector('#examSubjectName').textContent = examState.subjectName;
}

function renderQuestion() {
  const question = examState.questions[examState.currentIndex];
  const container = document.querySelector('#examQuestion');
  if (!question) {
    container.innerHTML = '<p>Loading questions...</p>';
    return;
  }

  // Update progress indicators
  document.querySelector('#currentQuestion').textContent = examState.currentIndex + 1;
  document.querySelector('#difficultyBadge').textContent = question.difficulty;
  document.querySelector('#difficultyBadge').className = `difficulty-badge difficulty-${question.difficulty.toLowerCase()}`;
  
  // Update progress bar
  const progress = ((examState.currentIndex + 1) / examState.questions.length) * 100;
  document.querySelector('#progressBar').style.width = progress + '%';

  // Update answered count
  const answeredCount = getAnsweredCount();
  document.querySelector('#answeredCount').textContent = `${answeredCount}/${examState.questions.length} answered`;

  container.innerHTML = `
    <article class="question-card card">
      <div class="question-text">
        <p>${question.text}</p>
      </div>
      <div class="question-options">
        ${['option_a','option_b','option_c','option_d'].map((optionKey) => {
          const letter = getOptionLetter(optionKey);
          const selected = examState.answers[question.id] === letter ? 'selected' : '';
          return `
            <button type="button" class="question-option ${selected}" data-option="${optionKey}" data-letter="${letter}">
              <span class="option-letter">${letter}</span>
              <span class="option-text">${question[optionKey]}</span>
            </button>
          `;
        }).join('')}
      </div>
    </article>
  `;

  document.querySelectorAll('.question-option').forEach((button) => {
    button.addEventListener('click', () => {
      const letter = button.dataset.letter;
      examState.answers[question.id] = letter;
      renderQuestion();
      renderQuestionNavigation();
    });
  });
}

function renderQuestionNavigation() {
  const navContainer = document.querySelector('#questionNav');
  const questionsPerRow = window.innerWidth < 768 ? 5 : 10;
  
  navContainer.innerHTML = examState.questions.map((question, index) => {
    const isAnswered = isQuestionAnswered(question.id);
    const isCurrent = examState.currentIndex === index;
    const statusClass = isCurrent ? 'current' : isAnswered ? 'answered' : 'unanswered';
    
    return `
      <button class="nav-button ${statusClass}" data-index="${index}" title="Question ${index + 1}">
        ${index + 1}
      </button>
    `;
  }).join('');

  document.querySelectorAll('.nav-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      examState.currentIndex = parseInt(btn.dataset.index, 10);
      renderQuestion();
      renderQuestionNavigation();
    });
  });
}

function startTimer() {
  const timer = document.querySelector('#timerDisplay');
  if (!timer) return;

  examState.timerId = setInterval(() => {
    examState.elapsedSeconds += 1;
    const remaining = getRemainingTime();
    timer.textContent = formatTimer(remaining);

    // Warning at 5 minutes
    if (remaining === 300) {
      timer.classList.add('timer-warning');
    }
    // Critical warning at 1 minute
    if (remaining === 60) {
      timer.classList.add('timer-critical');
    }
    // Time's up
    if (remaining <= 0) {
      handleTimeExpired();
    }
  }, 1000);
}

function stopTimer() {
  if (examState.timerId) {
    clearInterval(examState.timerId);
    examState.timerId = null;
  }
}

function handleTimeExpired() {
  stopTimer();
  examState.completed = true;
  
  // Show time's up modal
  document.querySelector('#timeUpModal').classList.remove('hidden');
  
  // Auto-submit after 2 seconds
  setTimeout(() => {
    submitExamFinal();
  }, 2000);
}

function navigateQuestion(direction) {
  const nextIndex = examState.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= examState.questions.length) return;
  examState.currentIndex = nextIndex;
  renderQuestion();
  renderQuestionNavigation();
}

function showConfirmationDialog() {
  const answeredCount = getAnsweredCount();
  const totalCount = examState.questions.length;
  const unansweredCount = totalCount - answeredCount;

  const summary = document.querySelector('#submissionSummary');
  summary.innerHTML = `
    <div class="submission-stats">
      <p><strong>${answeredCount}</strong> question${answeredCount !== 1 ? 's' : ''} answered</p>
      <p><strong>${unansweredCount}</strong> question${unansweredCount !== 1 ? 's' : ''} unanswered</p>
    </div>
  `;

  document.querySelector('#confirmationModal').classList.remove('hidden');
}

function hideConfirmationDialog() {
  document.querySelector('#confirmationModal').classList.add('hidden');
}

async function submitExamFinal() {
  stopTimer();
  const total = examState.questions.length;
  let score = 0;
  const answers = examState.answers;

  examState.questions.forEach((question) => {
    if (answers[question.id] === question.correct_answer) {
      score += 1;
    }
  });

  const percentage = total ? Math.round((score / total) * 100) : 0;
  const grade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';

  try {
    // Prepare a snapshot to allow result page to show explanations and user's answers
    const snapshot = {
      subjectId: examState.subjectId,
      subjectName: examState.subjectName,
      questions: examState.questions.map(q => ({
        id: q.id,
        text: q.text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      })),
      answers: examState.answers,
      score,
      total,
      percentage,
      grade,
      timeUsed: examState.elapsedSeconds,
      completedAt: new Date().toISOString()
    };

    const response = await fetch('/api/results', {
      method: 'POST',
      headers: CBT.getHeaders(),
      body: JSON.stringify({
        subjectId: examState.subjectId,
        score,
        total,
        percentage,
        grade,
        timeUsed: examState.elapsedSeconds
      })
    });
    if (!response.ok) {
      throw new Error('Unable to save exam result');
    }
    const data = await response.json();
    try {
      // Save snapshot keyed by resultId for the results page to consume
      localStorage.setItem(`exam_result_${data.resultId}`, JSON.stringify(snapshot));
    } catch (e) {
      // ignore storage errors
      console.warn('Could not save exam snapshot', e);
    }
    window.location.href = `result.html?resultId=${data.resultId}`;
  } catch (error) {
    console.error(error);
    alert(error.message || 'Submission failed');
  }
}

function bindExamActions() {
  document.querySelector('#prevQuestion').addEventListener('click', () => navigateQuestion(-1));
  document.querySelector('#nextQuestion').addEventListener('click', () => navigateQuestion(1));
  document.querySelector('#submitExam').addEventListener('click', showConfirmationDialog);
  
  // Modal actions
  document.querySelector('#confirmCancel').addEventListener('click', hideConfirmationDialog);
  document.querySelector('#confirmSubmit').addEventListener('click', () => {
    hideConfirmationDialog();
    submitExamFinal();
  });
  
  document.querySelector('#timeUpSubmit').addEventListener('click', submitExamFinal);
}

document.addEventListener('DOMContentLoaded', () => {
  bindExamActions();
  loadExam();
});
