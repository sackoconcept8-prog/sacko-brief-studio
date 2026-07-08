const form = document.getElementById('briefForm');
const thankYou = document.getElementById('thankYou');
const newBriefBtn = document.getElementById('newBriefBtn');
const exportBtn = document.getElementById('exportBtn');

function collectFormData() {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (!value.name) continue;
      if (!data[key]) data[key] = [];
      data[key].push({
        name: value.name,
        type: value.type || 'unknown',
        size: value.size
      });
    } else {
      data[key] = value;
    }
  }

  data.status = 'New';
  data.submittedAt = new Date().toISOString();
  return data;
}

function saveBrief(data) {
  const existingBriefs = JSON.parse(localStorage.getItem('sackoBriefs') || '[]');
  existingBriefs.unshift(data);
  localStorage.setItem('sackoBriefs', JSON.stringify(existingBriefs));
  localStorage.setItem('latestSackoBrief', JSON.stringify(data));
}

function downloadJSON(data, filename = 'sacko-client-brief.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.querySelectorAll('.pill-grid').forEach((group) => {
  const input = document.querySelector(`input[name="${group.dataset.name}"]`);

  group.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;
    event.target.classList.toggle('selected');

    const selectedValues = [...group.querySelectorAll('.selected')].map((button) => button.textContent.trim());
    input.value = selectedValues.join(', ');
  });
});

document.querySelectorAll('.upload-box input').forEach((input) => {
  input.addEventListener('change', () => {
    const box = input.closest('.upload-box');
    const label = box.querySelector('span');
    const fileCount = input.files.length;

    if (fileCount === 1) {
      label.textContent = input.files[0].name;
    } else if (fileCount > 1) {
      label.textContent = `${fileCount} files selected`;
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = collectFormData();
  saveBrief(data);

  form.classList.add('hidden');
  thankYou.classList.remove('hidden');
  thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

exportBtn.addEventListener('click', () => {
  const data = collectFormData();
  saveBrief(data);
  downloadJSON(data, `sacko-brief-${Date.now()}.json`);
});

newBriefBtn.addEventListener('click', () => {
  form.reset();
  document.querySelectorAll('.selected').forEach((item) => item.classList.remove('selected'));
  document.querySelectorAll('.upload-box span').forEach((span) => {
    if (!span.dataset.defaultText) span.dataset.defaultText = span.textContent;
    span.textContent = span.dataset.defaultText;
  });
  thankYou.classList.add('hidden');
  form.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth' });
});
