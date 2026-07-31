async function loadSubjects() {
  if (!CBT.requireAuth()) return;

  try {
    const response = await fetch('/api/subjects', {
      headers: CBT.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Unable to load subjects');
    }

    const data = await response.json();
    const subjectList = document.querySelector('#subjectList');
    if (!data.subjects || !data.subjects.length) {
      subjectList.innerHTML = '<div class="card"><p>No subjects are available yet.</p></div>';
      return;
    }

    subjectList.innerHTML = data.subjects.map((subject) => {
      return `
        <article class="card subject-card">
          <h3>${subject.name}</h3>
          <p>${subject.description}</p>
          <p><strong>Difficulty:</strong> ${subject.difficulty}</p>
          <a class="button" href="exam.html?subjectId=${subject.id}">Start Exam</a>
        </article>
      `;
    }).join('');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Unable to retrieve subjects');
  }
}

document.addEventListener('DOMContentLoaded', loadSubjects);
