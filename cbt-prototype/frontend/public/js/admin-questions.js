function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadSubjects() {
  const response = await fetch('/api/subjects', { headers: CBT.getHeaders() });
  if (!response.ok) {
    throw new Error('Unable to load subjects');
  }
  const data = await response.json();
  const subjectFilter = document.querySelector('#subjectFilter');
  subjectFilter.innerHTML = '<option value="">All subjects</option>' + data.subjects.map((subject) => `
    <option value="${subject.id}">${subject.name}</option>
  `).join('');
}

function renderQuestions(questions) {
  const container = document.querySelector('#questionList');
  if (!questions.length) {
    container.innerHTML = '<div class="card"><p>No questions match your search. Try a different subject or term.</p></div>';
    return;
  }

  container.innerHTML = questions.map((question) => `
    <article class="card">
      <div class="section-row">
        <div>
          <strong>${question.text}</strong>
          <p><strong>Subject:</strong> ${question.subject} · <strong>Difficulty:</strong> ${question.difficulty} · <strong>Answer:</strong> ${question.correct_answer}</p>
        </div>
        <div>
          <a class="button" href="admin-question-form.html?questionId=${question.id}">Edit</a>
        </div>
      </div>
    </article>
  `).join('');
}

async function loadQuestions() {
  try {
    const search = document.querySelector('#searchQuery').value.trim();
    const subjectId = document.querySelector('#subjectFilter').value;
    const query = [];
    if (search) query.push(`q=${encodeURIComponent(search)}`);
    if (subjectId) query.push(`subjectId=${encodeURIComponent(subjectId)}`);
    const queryString = query.length ? `?${query.join('&')}` : '';
    const response = await fetch(`/api/admin/questions${queryString}`, { headers: CBT.getHeaders() });
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    const data = await response.json();
    renderQuestions(data.questions);
  } catch (error) {
    console.error(error);
    document.querySelector('#questionList').innerHTML = `<div class="card"><p>${error.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!CBT.requireAdmin('login.html')) return;

  await loadSubjects();
  await loadQuestions();

  document.querySelector('#searchQuery').addEventListener('input', () => loadQuestions());
  document.querySelector('#subjectFilter').addEventListener('change', () => loadQuestions());
});
