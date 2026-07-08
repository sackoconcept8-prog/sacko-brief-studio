const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/' + 'AKfycbwqC59duqa2LZ9h-NVU0dg-ZYpnhOL2sa6u-RZaYFnnInEYvanZPbUtvFU8jM1fJYUrJA' + '/exec';
const form = document.getElementById('websiteBriefForm');
const thankYou = document.getElementById('thankYou');

const FORM_LABELS = {
  'brief.html': 'Website Brief',
  'logo-brief.html': 'Logo Co-Creation Brief',
  'banner-brief.html': 'Banner and Profile Upgrade Brief',
  'content-brief.html': 'Content Creation Brief'
};

function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'brief.html';
}

function cleanClientNavigation() {
  document.querySelectorAll('a[href="index.html"]').forEach((link) => {
    if (link.classList.contains('admin-link') || link.closest('.topbar-actions')) {
      link.remove();
    }
  });

  if (thankYou) {
    const backLink = thankYou.querySelector('.admin-link');
    if (backLink) backLink.remove();
    const thankText = thankYou.querySelector('p');
    if (thankText) {
      thankText.textContent = 'SACKO CONCEPT has received your brief. You may now close this page. We will contact you shortly by email or WhatsApp.';
    }
  }
}

function applyMotivationalHeroCopy() {
  const page = getCurrentPage();
  const copy = {
    'brief.html': {
      eyebrow: 'Premium Website Intake',
      title: 'Ready to build a website that makes your business look professional?',
      text: 'Complete this short brief so SACKO CONCEPT can understand your business, your goals and the website style you need before we start.',
      button: 'Start My Website Brief'
    },
    'logo-brief.html': {
      eyebrow: 'Logo Co-Creation Intake',
      title: 'Ready to give your brand a logo that feels premium and professional?',
      text: 'Share your business details, visual direction and brand preferences so we can co-create a logo that fits your identity.',
      button: 'Start My Logo Brief'
    },
    'banner-brief.html': {
      eyebrow: 'Banner & Profile Upgrade Intake',
      title: 'Ready to upgrade your online image with a stronger visual presence?',
      text: 'Tell us about your platform, message and design direction so we can create a banner or profile visual that looks clear, modern and credible.',
      button: 'Start My Banner Brief'
    },
    'content-brief.html': {
      eyebrow: 'Content Creation Intake',
      title: 'Ready to show up online with content that looks consistent and professional?',
      text: 'Choose your content package and share your goals, audience and topics so we can prepare posts that support your brand and offer.',
      button: 'Start My Content Brief'
    }
  }[page];

  if (!copy) return;
  const hero = document.querySelector('.brief-hero');
  if (!hero) return;
  const eyebrow = hero.querySelector('.eyebrow');
  const title = hero.querySelector('h1');
  const text = hero.querySelector('.hero-text');
  const button = hero.querySelector('.primary-link');

  if (eyebrow) eyebrow.textContent = copy.eyebrow;
  if (title) title.textContent = copy.title;
  if (text) text.textContent = copy.text;
  if (button) button.textContent = copy.button;
}

function relaxOptionalFields() {
  document.querySelectorAll('input[type="url"]').forEach((input) => {
    input.type = 'text';
    input.required = false;
    input.placeholder = input.placeholder || 'Paste a link, username, or write: I do not have one yet';
  });
}

cleanClientNavigation();
applyMotivationalHeroCopy();
relaxOptionalFields();

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
    if (!isOpen) wrap.classList.add('open');
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.info-wrap')) {
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

  const page = getCurrentPage();
  if (!obj.formType) obj.formType = FORM_LABELS[page] || page;
  obj.submittedAt = new Date().toISOString();
  obj.sourcePage = page;
  obj.projectStatus = 'New brief received';
  return obj;
}

function saveLocalSubmission(obj) {
  const saved = JSON.parse(localStorage.getItem('sackoWebsiteBriefs') || '[]');
  saved.unshift(obj);
  localStorage.setItem('sackoWebsiteBriefs', JSON.stringify(saved));
  localStorage.setItem('latestSackoWebsiteBrief', JSON.stringify(obj));
}

async function sendToGoogleSheets(obj) {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return { ok: false, reason: 'No Google Sheets URL configured' };

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
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
  form.classList.add('hidden');
  thankYou.classList.remove('hidden');
  thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
});