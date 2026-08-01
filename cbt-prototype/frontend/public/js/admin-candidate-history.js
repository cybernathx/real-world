function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadStudentHistory() {
  if (!CBT.requireAuth()) return;
  const studentId = getQueryParam('studentId');
  const info = document.querySelector('#studentInfo');
  const list = document.querySelector('#historyList');

  if (!studentId) {
    info.innerHTML = '<p>Student not specified.</p>';
    return;
  }

  try {
    info.innerHTML = '<p>Loading student info...</p>';
    const res = await fetch(`/api/admin/students`, { headers: CBT.getHeaders() });
    let students = [];
    if (res.ok) {
      const sd = await res.json();
      students = sd.students || [];
    }
    const student = students.find(s => s.id === Number(studentId));
    if (student) {
      info.innerHTML = `<strong>${student.name}</strong><p>${student.email}</p>`;
    } else {
      info.innerHTML = '<p>Student information unavailable.</p>';
    }

    list.innerHTML = '<p>Loading history...</p>';
    const hres = await fetch(`/api/admin/candidates/${studentId}/history`, { headers: CBT.getHeaders() });
    if (!hres.ok) throw new Error('Failed to load history');
    const hdata = await hres.json();
    if (!hdata.results || !hdata.results.length) {
      list.innerHTML = '<p>No exam records found for this student.</p>';
      return;
    }

    list.innerHTML = hdata.results.map(r => `
      <div style="border-bottom:1px solid var(--border);padding:0.75rem 0;">
        <p><strong>${r.subject}</strong> · ${r.percentage}% · Grade: ${r.grade}</p>
        <p>Score: ${r.score}/${r.total} · Time used: ${r.time_used} sec</p>
        <p>Completed: ${new Date(r.created_at).toLocaleString()}</p>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    list.innerHTML = '<p>Unable to load student history.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadStudentHistory);