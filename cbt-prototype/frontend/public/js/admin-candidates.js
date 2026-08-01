async function loadCandidates(page = 1) {
  if (!CBT.requireAuth()) return;
  const container = document.querySelector('#recordsTable');
  const pagination = document.querySelector('#pagination');
  const q = document.querySelector('#searchInput').value.trim();
  const subjectId = document.querySelector('#subjectFilter').value;

  try {
    container.innerHTML = '<p>Loading records...</p>';
    const params = new URLSearchParams({ page, limit: 20 });
    if (q) params.set('q', q);
    if (subjectId) params.set('subjectId', subjectId);

    const res = await fetch(`/api/admin/candidates?${params.toString()}`, { headers: CBT.getHeaders() });
    if (!res.ok) throw new Error('Failed to load candidate records');
    const data = await res.json();

    if (!data.records || !data.records.length) {
      container.innerHTML = '<p>No records found.</p>';
      pagination.innerHTML = '';
      return;
    }

    const rows = data.records.map(r => `
      <div class="record-row" style="display:flex;gap:1rem;align-items:center;border-bottom:1px solid var(--border);padding:0.75rem 0;">
        <div style="width:220px;"><strong>${r.student_name}</strong><br/><small>${r.student_email}</small></div>
        <div style="flex:1">${r.subject}</div>
        <div style="width:140px">${r.score}/${r.total} · ${r.percentage}%</div>
        <div style="width:120px">${r.grade}</div>
        <div style="width:160px">${new Date(r.created_at).toLocaleString()}</div>
        <div style="width:160px"><a class="button" href="admin-candidate-history.html?studentId=${r.student_id}">View History</a></div>
      </div>
    `).join('');

    container.innerHTML = `<div>${rows}</div>`;

    // pagination
    const total = data.total || 0;
    const limit = data.limit || 20;
    const current = data.page || 1;
    const pages = Math.ceil(total / limit);
    pagination.innerHTML = '';
    if (pages > 1) {
      for (let p = 1; p <= pages; p++) {
        const btn = document.createElement('button');
        btn.className = 'button button-secondary';
        btn.textContent = p;
        if (p === current) btn.disabled = true;
        btn.addEventListener('click', () => loadCandidates(p));
        pagination.appendChild(btn);
      }
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>Unable to load candidate records.</p>';
  }
}

async function loadSubjectsForFilter() {
  try {
    const res = await fetch('/api/admin/subjects', { headers: CBT.getHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const sel = document.querySelector('#subjectFilter');
    data.subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn('Could not load subjects', e);
  }
}

function bindActions() {
  document.querySelector('#searchBtn').addEventListener('click', () => loadCandidates(1));
}

document.addEventListener('DOMContentLoaded', async () => {
  bindActions();
  await loadSubjectsForFilter();
  loadCandidates(1);
});