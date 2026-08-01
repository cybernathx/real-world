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

    if (CBT.getUser()?.role === 'admin') {
      const adminSection = document.querySelector('#adminDashboardSection');
      const adminActions = document.querySelector('#adminActions');
      if (adminSection && adminActions) {
        adminSection.classList.remove('hidden');
        adminActions.innerHTML = `
          <article class="feature-card card">
            <h3>Total Students</h3>
            <p>${data.totalStudents ?? 0}</p>
          </article>
          <article class="feature-card card">
            <h3>Total Questions</h3>
            <p>${data.totalQuestions ?? 0}</p>
          </article>
          <article class="feature-card card">
            <h3>Total Exams Taken</h3>
            <p>${data.totalExams ?? 0}</p>
          </article>
          <article class="feature-card card">
            <h3>Total Subjects</h3>
            <p>${data.totalSubjects ?? 0}</p>
          </article>
          <article class="feature-card card">
            <h3>Manage Questions</h3>
            <a class="button" href="admin-questions.html">Open Question Manager</a>
          </article>
          <article class="feature-card card">
            <h3>Candidate Records</h3>
            <a class="button" href="admin-candidates.html">View Candidate Records</a>
          </article>
        `;

        // Recent activity
        const attemptsContainer = document.querySelector('#recentAttempts');
        if (Array.isArray(data.recentActivity) && data.recentActivity.length) {
          attemptsContainer.innerHTML = data.recentActivity.map((attempt) => {
            return `
              <article class="card attempt-card">
                <strong>${attempt.subject}</strong>
                <span>${attempt.percentage.toFixed(1)}% · ${attempt.score}/${attempt.total} points</span>
                <span>Grade: ${attempt.grade}</span>
                <span>Student: ${attempt.student_name}</span>
                <span>Time used: ${attempt.time_used} sec</span>
              </article>
            `;
          }).join('');
        }
      }
    }
  } catch (error) {
    console.error(error);
    alert('Failed to load your dashboard. Please sign in again.');
    CBT.logout();
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
