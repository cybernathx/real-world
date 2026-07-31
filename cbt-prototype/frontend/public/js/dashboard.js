async function loadDashboard() {
  if (!CBT.requireAuth()) return;

  try {
    const response = await fetch('/api/dashboard/me', {
      headers: CBT.getHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        CBT.logout();
      }
      throw new Error('Unable to load dashboard data');
    }

    const data = await response.json();
    document.querySelector('#welcomeText').textContent = data.welcome || 'Welcome back';
    document.querySelector('#availableExams').textContent = data.availableExams ?? 0;
    document.querySelector('#completedExams').textContent = data.completedExams ?? 0;
    document.querySelector('#averageScore').textContent = `${data.averageScore ?? 0}%`;

    const attemptsContainer = document.querySelector('#recentAttempts');
    if (Array.isArray(data.recentAttempts) && data.recentAttempts.length) {
      attemptsContainer.innerHTML = data.recentAttempts.map((attempt) => {
        return `
          <article class="card attempt-card">
            <strong>${attempt.subject}</strong>
            <span>${attempt.percentage.toFixed(1)}% · ${attempt.score}/${attempt.total} points</span>
            <span>Grade: ${attempt.grade}</span>
            <span>Time used: ${attempt.time_used} sec</span>
          </article>
        `;
      }).join('');
    } else {
      attemptsContainer.innerHTML = '<div class="card"><p>No exam attempts yet. Start your first subject to begin tracking progress.</p></div>';
    }
  } catch (error) {
    console.error(error);
    alert('Failed to load your dashboard. Please sign in again.');
    CBT.logout();
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
