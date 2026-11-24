import { nextFocusIndex } from '/src/focus.mjs';

const releasesEl = document.querySelector('#releases');
const loadMoreEl = document.querySelector('#load-more');
const activityEl = document.querySelector('#activity');
const searchEl = document.querySelector('#search');
const detailsEl = document.querySelector('#details');
const detailsBodyEl = document.querySelector('#details-body');
const detailsCloseEl = document.querySelector('#details-close');

const labels = { ready: 'Ready', 'at-risk': 'At risk', 'on-track': 'On track' };

const cards = () => [...releasesEl.querySelectorAll('.release')];
let currentPage = 1;
let totalPages = 1;
let requestId = 0;

const card = (r) => `
    <li class="release" tabindex="-1" data-id="${r.id}">
      <div class="release-head">
        <strong>${r.name}</strong> <span class="version">v${r.version}</span>
        <span class="badge ${r.status}">${labels[r.status]}</span>
      </div>
      <div class="meta">${r.owner} · target ${r.target}</div>
      <div class="bar" role="progressbar" aria-valuenow="${r.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${r.name} checklist">
        <span style="width:${r.progress}%"></span>
      </div>
    </li>`;

async function loadReleases(page = 1) {
  const id = ++requestId;
  const data = await fetch(`/api/releases?page=${page}&perPage=5&q=${encodeURIComponent(searchEl.value)}`).then((r) => r.json());
  if (id !== requestId) return;
  const html = data.items.map(card).join('');
  if (page === 1) releasesEl.innerHTML = html;
  else releasesEl.insertAdjacentHTML('beforeend', html);
  cards()[0]?.setAttribute('tabindex', '0');
  currentPage = data.page;
  totalPages = data.pages;
  loadMoreEl.hidden = currentPage >= totalPages;
  loadMoreEl.disabled = false;
}

loadMoreEl.addEventListener('click', () => {
  loadMoreEl.disabled = true;
  loadReleases(currentPage + 1).catch(() => { loadMoreEl.disabled = false; });
});

searchEl.addEventListener('input', () => loadReleases(1));

let openerEl = null;
let detailsRequest = 0;

async function openDetails(cardEl) {
  const id = ++detailsRequest;
  const r = await fetch(`/api/releases/${cardEl.dataset.id}`).then((res) => res.json());
  if (id !== detailsRequest) return;
  openerEl = cardEl;
  detailsBodyEl.innerHTML = `
    <h3 id="details-title">${r.name} <span class="version">v${r.version}</span></h3>
    <p class="meta">${r.owner} · target ${r.target} · ${labels[r.status]} · ${r.progress}% done</p>
    <ul class="checklist">${r.checklist.map((c) => `<li>${c.done ? '✓' : '○'} ${c.text}</li>`).join('')}</ul>`;
  detailsEl.hidden = false;
  detailsCloseEl.focus();
}

function closeDetails() {
  detailsRequest++;
  detailsEl.hidden = true;
  if (openerEl?.isConnected) openerEl.focus();
  openerEl = null;
}

detailsCloseEl.addEventListener('click', closeDetails);

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'Escape') {
    if (!detailsEl.hidden) { event.preventDefault(); closeDetails(); }
    return;
  }
  const typing = event.target.closest?.('input, textarea, select, [contenteditable]');
  if (typing) return;
  const list = cards();
  if (event.key === 'j' || event.key === 'k') {
    event.preventDefault();
    const index = nextFocusIndex(list.indexOf(document.activeElement), list.length, event.key);
    if (index < 0) return;
    list.forEach((el, i) => el.setAttribute('tabindex', i === index ? '0' : '-1'));
    list[index].focus();
  } else if (event.key === 'Enter' && event.target.classList?.contains('release')) {
    event.preventDefault();
    openDetails(event.target);
  }
});

async function loadActivity() {
  const entries = await fetch('/api/activity').then((r) => r.json());
  activityEl.innerHTML = entries.map((e) => `<li><time datetime="${e.at}">${e.when}</time> ${e.text}</li>`).join('');
}

loadReleases();
loadActivity();
