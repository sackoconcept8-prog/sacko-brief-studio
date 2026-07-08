const GOOGLE_SHEETS_WEB_APP_URL = '';
const form = document.getElementById('websiteBriefForm');
const thankYou = document.getElementById('thankYou');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
  revealObserver.observe(item);
});

document.querySelectorAll('.package-option input').forEach((input) => {
  input.addEventListener('change', () => {
    document.querySelectorAll('.package-option').forEach((card) => card.classList.remove('selected'));
    input.closest('.package-option').classList.add('selected');
  });
});

document.querySelectorAll('.info-dot').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const wrap = button.closest('.info-wrap');
    const isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.info-wrap.open').forEach((item) => item.classList.remove('open'));
    if (!isOpen) {
      wrap.classList.add('open');
    }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.info-wrap')) {
    document.querySelectorAll('.info-wrap.open').forEach((item) => item.classList.remove('open'));
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.info-wrap.open').forEach((item) => item.classList.remove('open'));
  }
});

function getFormObject() {
  const data = new FormData(form);
  const obj = {};

  for (const [key, value] of data.entries()) {
    if (obj[key]) {
      obj[key] = Array.isArray(obj[key]) ? [...obj[key], value] : [obj[key], value];
    } else {
      obj[key] = value;
    }
  }

  obj.submittedAt = new Date().toISOString();
  obj.projectStatus = 'New brief received';
  return obj;
}

function saveLocalSubmission(obj) {
  const saved = JSON.parse(localStorage.getItem('sackoWebsiteBriefs') || '[]');
  saved.unshift(obj);
  localStorage.setItem('sackoWebsiteBriefs', JSON.stringify(saved));
  localStorage.setItem('latestSackoWebsiteBrief', JSON.stringify(obj));
}

function downloadCSV(obj) {
  const headers = Object.keys(obj);
  const row = headers.map((key) => {
    const value = Array.isArray(obj[key]) ? obj[key].join(' | ') : String(obj[key] || '');
    return `"${value.replace(/"/g, '""')}"`;
  });

  const csv = `${headers.join(',')}\n${row.join(',')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sacko-website-brief-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function sendToGoogleSheets(obj) {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return { ok: false, reason: 'No Google Sheets URL configured' };

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submission = getFormObject();
  saveLocalSubmission(submission);
  await sendToGoogleSheets(submission);

  if (!GOOGLE_SHEETS_WEB_APP_URL) {
    downloadCSV(submission);
  }

  form.classList.add('hidden');
  thankYou.classList.remove('hidden');
  thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
});