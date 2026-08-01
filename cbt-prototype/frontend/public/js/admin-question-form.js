function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showMessage(text, type = 'success') {
  const messageEl = document.querySelector('#formMessage');
  messageEl.textContent = text;
  messageEl.style.color = type === 'error' ? '#b00020' : '#0b5fff';
}

async function loadSubjects() {
  const response = await fetch('/api/subjects', { headers: CBT.getHeaders() });
  if (!response.ok) {
    throw new Error('Unable to load subjects');
  }
  const data = await response.json();
  const subjectSelect = document.querySelector('#subjectSelect');
  subjectSelect.innerHTML = '<option value="">Select a subject</option>' + data.subjects.map((subject) => `
    <option value="${subject.id}">${subject.name}</option>
  `).join('');
}

function fillForm(question) {
  document.querySelector('#subjectSelect').value = question.subject_id;
  document.querySelector('#questionText').value = question.text;
  document.querySelector('#optionA').value = question.option_a;
  document.querySelector('#optionB').value = question.option_b;
  document.querySelector('#optionC').value = question.option_c;
  document.querySelector('#optionD').value = question.option_d;
  document.querySelector('#correctAnswer').value = question.correct_answer;
  document.querySelector('#difficulty').value = question.difficulty;
  document.querySelector('#explanation').value = question.explanation;
}

async function loadQuestion(questionId) {
  const response = await fetch(`/api/questions/${questionId}`, { headers: CBT.getHeaders() });
  if (!response.ok) {
    throw new Error('Unable to load question details');
  }
  const data = await response.json();
  fillForm(data.question);
}

async function submitForm(event) {
  event.preventDefault();
  const questionId = getQueryParam('questionId');

  const payload = {
    subjectId: Number(document.querySelector('#subjectSelect').value),
    text: document.querySelector('#questionText').value.trim(),
    optionA: document.querySelector('#optionA').value.trim(),
    optionB: document.querySelector('#optionB').value.trim(),
    optionC: document.querySelector('#optionC').value.trim(),
    optionD: document.querySelector('#optionD').value.trim(),
    correctAnswer: document.querySelector('#correctAnswer').value,
    difficulty: document.querySelector('#difficulty').value,
    explanation: document.querySelector('#explanation').value.trim()
  };

  if (!payload.subjectId || !payload.text || !payload.optionA || !payload.optionB || !payload.optionC || !payload.optionD || !payload.correctAnswer || !payload.difficulty || !payload.explanation) {
    showMessage('Please fill in all fields before saving.', 'error');
    return;
  }

  try {
    const method = questionId ? 'PUT' : 'POST';
    const url = questionId ? `/api/admin/questions/${questionId}` : '/api/admin/questions';
    const response = await fetch(url, {
      method,
      headers: CBT.getHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to save question');
    }

    showMessage(data.message || 'Save successful');
    window.setTimeout(() => {
      window.location.href = 'admin-questions.html';
    }, 900);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!CBT.requireAdmin('login.html')) return;

  try {
    await loadSubjects();
    const questionId = getQueryParam('questionId');
    if (questionId) {
      document.querySelector('#formMode').textContent = 'Edit question';
      document.querySelector('#formTitle').textContent = 'Update Question';
      await loadQuestion(questionId);
    }
  } catch (error) {
    showMessage(error.message, 'error');
  }

  document.querySelector('#questionForm').addEventListener('submit', submitForm);
});
