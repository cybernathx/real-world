let examState = {
  subjectId: null,
  subjectName: '',
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: null,
  elapsedSeconds: 0,
  completed: false
};

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getOptionLetter(optionKey) {
  return optionKey.toUpperCase().replace('OPTION_', '');
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
  renderQuestion();
  startTimer();
}

function renderExamHeader() {
  document.querySelector('#examSubjectName').textContent = examState.subjectName;
  document.querySelector('#examStatus').textContent = `Question ${examState.currentIndex + 1} of 10`;
}

function renderQuestion() {
  const question = examState.questions[examState.currentIndex];
  const container = document.querySelector('#examQuestion');
  if (!question) {
    container.innerHTML = '<p>Loading questions...</p>';
    return;
  }

  container.innerHTML = `
    <article class="question-card card">
      <div class="exam-progress">
        <div>
          <strong>${question.difficulty} difficulty</strong>
          <p>${question.text}</p>
        </div>
        <div>
          <span>Time: <strong id="timerDisplay">${formatTimer(examState.elapsedSeconds)}</strong></span>
        </div>
      </div>
      <div class="question-options">
        ${['option_a','option_b','option_c','option_d'].map((optionKey) => {
          const selected = examState.answers[question.id] === getOptionLetter(optionKey) ? 'selected' : '';
          return `<button type="button" class="question-option ${selected}" data-option="${optionKey}">${question[optionKey]}</button>`;
        }).join('')}
      </div>
    </article>
  `;

  document.querySelectorAll('.question-option').forEach((button) => {
    button.addEventListener('click', () => {
      examState.answers[question.id] = getOptionLetter(button.dataset.option);
      renderQuestion();
    });
  });

  document.querySelector('#examStatus').textContent = `Question ${examState.currentIndex + 1} of ${examState.questions.length}`;
}

function startTimer() {
  const timer = document.querySelector('#timerDisplay');
  if (!timer) return;

  examState.timerId = setInterval(() => {
    examState.elapsedSeconds += 1;
    timer.textContent = formatTimer(examState.elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (examState.timerId) {
    clearInterval(examState.timerId);
    examState.timerId = null;
  }
}

function navigateQuestion(direction) {
  const nextIndex = examState.currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= examState.questions.length) return;
  examState.currentIndex = nextIndex;
  renderQuestion();
}

async function submitExam() {
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
    window.location.href = `result.html?resultId=${data.resultId}`;
  } catch (error) {
    console.error(error);
    alert(error.message || 'Submission failed');
  }
}

function bindExamActions() {
  document.querySelector('#prevQuestion').addEventListener('click', () => navigateQuestion(-1));
  document.querySelector('#nextQuestion').addEventListener('click', () => navigateQuestion(1));
  document.querySelector('#submitExam').addEventListener('click', submitExam);
}

document.addEventListener('DOMContentLoaded', () => {
  bindExamActions();
  loadExam();
});
