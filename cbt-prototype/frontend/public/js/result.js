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
  } catch (error) {
    console.error(error);
    resultSummary.innerHTML = '<p>Unable to display result at this time.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadResult);
