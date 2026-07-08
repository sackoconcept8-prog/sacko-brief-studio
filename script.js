const STORAGE_KEY = 'sackoWorkStudioProjects';
const SETTINGS_KEY = 'sackoWorkStudioSettings';
const statuses = ['New', 'In Progress', 'Waiting for Client', 'Completed'];

const projectTable = document.getElementById('projectTable');
const clientDetail = document.getElementById('clientDetail');
const kanban = document.getElementById('kanban');
const weekSummary = document.getElementById('weekSummary');
const priorityTasks = document.getElementById('priorityTasks');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const openProjectModal = document.getElementById('openProjectModal');
const closeProjectModal = document.getElementById('closeProjectModal');
const cancelProject = document.getElementById('cancelProject');
const resetDemo = document.getElementById('resetDemo');

let projects = loadProjects();
let selectedProjectId = projects[0]?.id || null;

function todayOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultProjects() {
  return [
    {
      id: crypto.randomUUID(),
      clientName: 'Awa Diop',
      businessName: 'Awa Beauty Studio',
      email: 'awa@example.com',
      whatsapp: '+221 77 000 00 00',
      service: 'Profil d’Impact',
      status: 'In Progress',
      price: '$45',
      paymentStatus: 'Deposit Paid',
      deadline: todayOffset(3),
      source: 'Facebook Ad',
      createdAt: new Date().toISOString(),
      nextAction: 'Create the first banner concept and profile bio.',
      notes: 'Client wants a clean, feminine and premium visual direction with beige, gold and soft pink accents.',
      deliverables: [
        { text: 'Professional banner', done: true },
        { text: 'Professional bio', done: true },
        { text: '3 ready-to-post contents', done: false },
        { text: 'Mini profile showcase', done: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      clientName: 'Michael Brown',
      businessName: 'MB Consulting',
      email: 'michael@example.com',
      whatsapp: '+1 555 000 0000',
      service: 'Impact Business',
      status: 'New',
      price: '$95',
      paymentStatus: 'Pending',
      deadline: todayOffset(7),
      source: 'Instagram',
      createdAt: new Date().toISOString(),
      nextAction: 'Review client brief and confirm payment link.',
      notes: 'Needs a serious business profile with strong trust and premium positioning.',
      deliverables: [
        { text: '2 logo concepts', done: false },
        { text: 'Premium banner', done: false },
        { text: 'Professional bio', done: false },
        { text: '5 ready-to-post contents', done: false },
        { text: 'Advanced mini website', done: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      clientName: 'Sarah Johnson',
      businessName: 'Digital Launch Co.',
      email: 'sarah@example.com',
      whatsapp: '+44 7000 000000',
      service: 'Digital Product Page',
      status: 'Waiting for Client',
      price: '$120',
      paymentStatus: 'Paid',
      deadline: todayOffset(1),
      source: 'WhatsApp',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      nextAction: 'Wait for product screenshots and final price confirmation.',
      notes: 'Client likes dark luxury SaaS style with gold accents and strong conversion sections.',
      deliverables: [
        { text: 'Product hero section', done: true },
        { text: 'Offer breakdown section', done: true },
        { text: 'FAQ section', done: false },
        { text: 'Payment CTA section', done: false }
      ]
    },
    {
      id: crypto.randomUUID(),
      clientName: 'Jean Kouame',
      businessName: 'KJ Immobilier',
      email: 'jean@example.com',
      whatsapp: '+225 07 00 00 00 00',
      service: 'Mini Website',
      status: 'Completed',
      price: '$150',
      paymentStatus: 'Paid',
      deadline: todayOffset(-1),
      source: 'Referral',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      completedAt: new Date().toISOString(),
      nextAction: 'Send final files and request testimonial.',
      notes: 'Project completed. Client may come back for social media templates.',
      deliverables: [
        { text: 'Landing page structure', done: true },
        { text: 'Hero section copy', done: true },
        { text: 'WhatsApp contact button', done: true },
        { text: 'Final delivery link', done: true }
      ]
    }
  ];
}

function loadProjects() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const demo = defaultProjects();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  return demo;
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : {};
}

function saveSettings() {
  const settings = {
    studioName: document.getElementById('studioName').value,
    studioWhatsapp: document.getElementById('studioWhatsapp').value,
    jotformLink: document.getElementById('jotformLink').value,
    paymentLink: document.getElementById('paymentLink').value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings() {
  const settings = loadSettings();
  Object.entries(settings).forEach(([key, value]) => {
    const field = document.getElementById(key);
    if (field) field.value = value;
  });
}

function startOfWeek(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function isThisWeek(dateString) {
  if (!dateString) return false;
  return new Date(dateString) >= startOfWeek();
}

function isUrgent(deadline, status) {
  if (!deadline || status === 'Completed') return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function statusClass(value) {
  return String(value).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
}

function getProgress(project) {
  const total = project.deliverables?.length || 0;
  if (!total) return { done: 0, total: 0, percent: 0 };
  const done = project.deliverables.filter(item => item.done).length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

function formatDate(dateString) {
  if (!dateString) return 'No deadline';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFilteredProjects() {
  const search = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  return projects.filter(project => {
    const searchText = [project.clientName, project.businessName, project.service, project.status, project.nextAction, project.notes]
      .join(' ')
      .toLowerCase();
    const matchSearch = !search || searchText.includes(search);
    const matchStatus = status === 'All' || project.status === status;
    return matchSearch && matchStatus;
  });
}

function renderStats() {
  const weekClients = projects.filter(project => isThisWeek(project.createdAt)).length;
  const active = projects.filter(project => project.status !== 'Completed').length;
  const pending = projects.filter(project => project.paymentStatus !== 'Paid').length;
  const urgent = projects.filter(project => isUrgent(project.deadline, project.status)).length;

  document.getElementById('weekClients').textContent = weekClients;
  document.getElementById('activeProjects').textContent = active;
  document.getElementById('pendingPayments').textContent = pending;
  document.getElementById('urgentDeadlines').textContent = urgent;
}

function renderTable() {
  const filtered = getFilteredProjects();
  projectTable.innerHTML = '';

  if (!filtered.length) {
    projectTable.innerHTML = `<tr><td colspan="8" class="empty-state">No client project found.</td></tr>`;
    return;
  }

  filtered.forEach(project => {
    const progress = getProgress(project);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="client-name">${project.clientName}</span><span class="client-meta">${project.businessName || 'No business name'}</span></td>
      <td>${project.service}</td>
      <td>
        <select data-id="${project.id}" data-field="status">
          ${statuses.map(status => `<option ${project.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </td>
      <td>${formatDate(project.deadline)}</td>
      <td>${project.price || '-'}</td>
      <td>
        <select data-id="${project.id}" data-field="paymentStatus">
          ${['Pending', 'Deposit Paid', 'Paid'].map(status => `<option ${project.paymentStatus === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </td>
      <td><div class="progress-bar"><span style="width:${progress.percent}%"></span></div><span class="progress-label">${progress.done}/${progress.total} done</span></td>
      <td><button class="action-btn" data-view="${project.id}">Open</button></td>
    `;
    projectTable.appendChild(row);
  });
}

function renderDetail() {
  const project = projects.find(item => item.id === selectedProjectId);

  if (!project) {
    clientDetail.innerHTML = `<p class="eyebrow">Selected Client</p><h2>No client selected</h2><p class="muted">Choose a client in the table to see the work to deliver, notes and next action.</p>`;
    return;
  }

  const progress = getProgress(project);
  const whatsappLink = project.whatsapp ? `https://wa.me/${project.whatsapp.replace(/\D/g, '')}` : '#';
  const mailLink = project.email ? `mailto:${project.email}` : '#';

  clientDetail.innerHTML = `
    <p class="eyebrow">Selected Client</p>
    <h2>${project.clientName}</h2>
    <p class="muted">${project.businessName || 'No business name'} • ${project.service}</p>

    <div class="detail-list">
      <div class="detail-row"><span>Status</span><strong class="status-pill status-${statusClass(project.status)}">${project.status}</strong></div>
      <div class="detail-row"><span>Payment</span><strong class="payment-pill payment-${statusClass(project.paymentStatus)}">${project.paymentStatus}</strong></div>
      <div class="detail-row"><span>Deadline</span><strong>${formatDate(project.deadline)}</strong></div>
      <div class="detail-row"><span>Price</span><strong>${project.price || '-'}</strong></div>
      <div class="detail-row"><span>Source</span><strong>${project.source || '-'}</strong></div>
      <div class="detail-row"><span>Progress</span><strong>${progress.percent}%</strong></div>
    </div>

    <h3>What you must deliver</h3>
    <div class="deliverables">
      ${(project.deliverables || []).map((item, index) => `
        <label class="deliverable-item ${item.done ? 'done' : ''}">
          <input type="checkbox" data-deliverable-id="${project.id}" data-index="${index}" ${item.done ? 'checked' : ''} />
          <span>${item.text}</span>
        </label>
      `).join('') || '<p class="muted">No deliverables added yet.</p>'}
    </div>

    <div class="notes-box">
      <strong>Next action:</strong><br />${project.nextAction || 'No next action added.'}
    </div>

    <div class="notes-box">
      <strong>Notes:</strong><br />${project.notes || 'No notes added.'}
    </div>

    <div class="detail-actions">
      <a class="ghost-link" href="${whatsappLink}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="ghost-link" href="${mailLink}">Email</a>
    </div>
  `;
}

function renderKanban() {
  kanban.innerHTML = statuses.map(status => {
    const items = projects.filter(project => project.status === status);
    return `
      <div class="kanban-column">
        <h3>${status} • ${items.length}</h3>
        ${items.map(project => `
          <article class="kanban-card" data-view="${project.id}">
            <strong>${project.clientName}</strong>
            <span>${project.service}</span>
            <span>${formatDate(project.deadline)} • ${project.price || '-'}</span>
          </article>
        `).join('') || '<p class="muted">No project here.</p>'}
      </div>
    `;
  }).join('');
}

function renderWeek() {
  const createdThisWeek = projects.filter(project => isThisWeek(project.createdAt));
  const completedThisWeek = projects.filter(project => isThisWeek(project.completedAt));
  const dueThisWeek = projects.filter(project => isUrgent(project.deadline, project.status));
  const pendingPayments = projects.filter(project => project.paymentStatus !== 'Paid');

  weekSummary.innerHTML = `
    <div class="week-item"><strong>${createdThisWeek.length} new client(s) this week</strong><span>${createdThisWeek.map(p => p.clientName).join(', ') || 'No new client added yet.'}</span></div>
    <div class="week-item"><strong>${dueThisWeek.length} urgent deadline(s)</strong><span>${dueThisWeek.map(p => `${p.clientName} — ${formatDate(p.deadline)}`).join('<br>') || 'No urgent deadline.'}</span></div>
    <div class="week-item"><strong>${pendingPayments.length} pending payment(s)</strong><span>${pendingPayments.map(p => `${p.clientName} — ${p.price || '-'}`).join('<br>') || 'No pending payment.'}</span></div>
    <div class="week-item"><strong>${completedThisWeek.length} completed project(s)</strong><span>${completedThisWeek.map(p => p.clientName).join(', ') || 'No completed project this week.'}</span></div>
  `;

  const activeTasks = projects
    .filter(project => project.status !== 'Completed')
    .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'))
    .slice(0, 6);

  priorityTasks.innerHTML = activeTasks.map(project => `
    <div class="task-item" data-view="${project.id}">
      <strong>${project.clientName} — ${project.service}</strong>
      <span>${project.nextAction || 'Define the next action.'}</span><br />
      <span>Deadline: ${formatDate(project.deadline)} • Status: ${project.status}</span>
    </div>
  `).join('') || '<p class="muted">No priority task for now.</p>';
}

function renderAll() {
  renderStats();
  renderTable();
  renderDetail();
  renderKanban();
  renderWeek();
}

function parseDeliverables(text) {
  return text
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
    .map(text => ({ text, done: false }));
}

function addProject(formData) {
  const project = {
    id: crypto.randomUUID(),
    clientName: formData.get('clientName'),
    businessName: formData.get('businessName'),
    email: formData.get('email'),
    whatsapp: formData.get('whatsapp'),
    service: formData.get('service'),
    status: formData.get('status'),
    price: formData.get('price'),
    paymentStatus: formData.get('paymentStatus'),
    deadline: formData.get('deadline'),
    source: formData.get('source'),
    deliverables: parseDeliverables(formData.get('deliverables') || ''),
    notes: formData.get('notes'),
    nextAction: formData.get('nextAction'),
    createdAt: new Date().toISOString(),
    completedAt: formData.get('status') === 'Completed' ? new Date().toISOString() : null
  };

  projects.unshift(project);
  selectedProjectId = project.id;
  saveProjects();
  renderAll();
}

projectTable.addEventListener('click', event => {
  const viewId = event.target.dataset.view;
  if (!viewId) return;
  selectedProjectId = viewId;
  renderDetail();
  clientDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

projectTable.addEventListener('change', event => {
  const id = event.target.dataset.id;
  const field = event.target.dataset.field;
  if (!id || !field) return;

  const project = projects.find(item => item.id === id);
  project[field] = event.target.value;
  if (field === 'status' && event.target.value === 'Completed') project.completedAt = new Date().toISOString();
  saveProjects();
  renderAll();
});

clientDetail.addEventListener('change', event => {
  const id = event.target.dataset.deliverableId;
  const index = Number(event.target.dataset.index);
  if (!id || Number.isNaN(index)) return;

  const project = projects.find(item => item.id === id);
  project.deliverables[index].done = event.target.checked;
  saveProjects();
  renderAll();
});

kanban.addEventListener('click', event => {
  const card = event.target.closest('[data-view]');
  if (!card) return;
  selectedProjectId = card.dataset.view;
  renderDetail();
  clientDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

priorityTasks.addEventListener('click', event => {
  const item = event.target.closest('[data-view]');
  if (!item) return;
  selectedProjectId = item.dataset.view;
  renderDetail();
  clientDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

searchInput.addEventListener('input', renderTable);
statusFilter.addEventListener('change', renderTable);

openProjectModal.addEventListener('click', () => projectModal.showModal());
closeProjectModal.addEventListener('click', () => projectModal.close());
cancelProject.addEventListener('click', () => projectModal.close());

projectForm.addEventListener('submit', event => {
  event.preventDefault();
  addProject(new FormData(projectForm));
  projectForm.reset();
  projectModal.close();
});

resetDemo.addEventListener('click', () => {
  const confirmed = confirm('Reset workspace with demo projects? This will replace local data in this browser.');
  if (!confirmed) return;
  projects = defaultProjects();
  selectedProjectId = projects[0].id;
  saveProjects();
  renderAll();
});

document.querySelectorAll('#settings input').forEach(input => {
  input.addEventListener('change', saveSettings);
});

applySettings();
renderAll();
