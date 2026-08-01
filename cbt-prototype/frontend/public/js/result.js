function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadResult() {
  if (!CBT.requireAuth()) return;

  const resultId = getQueryParam('resultId');
  const resultSummary = document.querySelector('#resultSummary');

  if (!resultId) {
    resultSummary.innerHTML = '<p>Result details are unavailable.</p>';
    return;
  }

  try {
    const response = await fetch(`/api/results/student/${CBT.getUser()?.id}`, {
      headers: CBT.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Unable to load result history');
    }

    const data = await response.json();
    const result = data.results.find((item) => item.id === Number(resultId));
    if (!result) {
      resultSummary.innerHTML = '<p>The requested result could not be found.</p>';
      return;
    }

    resultSummary.innerHTML = `
      <div class="card">
        <p><strong>Subject:</strong> ${result.subject_name}</p>
        <p><strong>Score:</strong> ${result.score}/${result.total}</p>
        <p><strong>Percentage:</strong> ${result.percentage}%</p>
        <p><strong>Grade:</strong> ${result.grade}</p>
        <p><strong>Time used:</strong> ${result.time_used} sec</p>
        <p><strong>Completed:</strong> ${new Date(result.created_at).toLocaleString()}</p>
      </div>
    `;
    // Pass / Fail
    const pass = result.percentage >= 50;
    const statusHtml = `<div class="card" style="margin-top:1rem;"><p><strong>Status:</strong> ${pass ? '<span style="color:var(--accent);">Passed</span>' : '<span style="color:#ef4444">Failed</span>'}</p>
      <div style="margin-top:0.5rem;"><a class="button" href="subjects.html">Retake (choose subject)</a> <a class="button button-secondary" href="subjects.html?subjectId=${result.subject_id}">Retake same subject</a></div></div>`;
    resultSummary.insertAdjacentHTML('beforeend', statusHtml);
    
    // Try to load snapshot saved at submission to show explanations and user's answers
    const snapshotKey = `exam_result_${resultId}`;
    const snapshotRaw = localStorage.getItem(snapshotKey);
    if (snapshotRaw) {
      try {
        const snapshot = JSON.parse(snapshotRaw);
        // Render detailed question list with user's answers and explanations
        const detailed = document.createElement('div');
        detailed.className = 'card';
        detailed.innerHTML = `<h3>Question Review</h3>` + snapshot.questions.map((q) => {
          const userAns = snapshot.answers[q.id];
          const correct = q.correct_answer;
          const isCorrect = userAns === correct;
          return `
            <div class="review-item" style="margin-bottom:1rem;">
              <p><strong>${q.text}</strong></p>
              <p>Your answer: <strong>${userAns || '—'}</strong> ${isCorrect ? '✅' : '❌'}</p>
              <p>Correct answer: <strong>${correct}</strong></p>
              ${q.explanation ? `<p><em>Explanation:</em> ${q.explanation}</p>` : ''}
            </div>
          `;
        }).join('');
        resultSummary.appendChild(detailed);
      } catch (e) {
        console.warn('Invalid exam snapshot', e);
      }
    } else {
      // Fallback: load questions for subject (without user's answers)
      try {
        const qres = await fetch(`/api/questions?subjectId=${result.subject_id}&limit=0&includeAnswer=true`, { headers: CBT.getHeaders() });
        if (qres.ok) {
          const qdata = await qres.json();
          if (Array.isArray(qdata.questions) && qdata.questions.length) {
            const detailed = document.createElement('div');
            detailed.className = 'card';
            detailed.innerHTML = `<h3>Question Explanations</h3>` + qdata.questions.map((q) => `
              <div style="margin-bottom:1rem;">
                <p><strong>${q.text}</strong></p>
                <p>Correct answer: <strong>${q.correct_answer}</strong></p>
                ${q.explanation ? `<p><em>Explanation:</em> ${q.explanation}</p>` : ''}
              </div>
            `).join('');
            resultSummary.appendChild(detailed);
          }
        }
      } catch (e) {
        console.warn('Could not load question explanations', e);
      }
    }
  } catch (error) {
    console.error(error);
    resultSummary.innerHTML = '<p>Unable to display result at this time.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadResult);
