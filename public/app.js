import { keyFocusTarget, restoreFocusIndex } from '/src/focus.mjs';

const releasesEl = document.querySelector('#releases');
const loadMoreEl = document.querySelector('#load-more');
const activityEl = document.querySelector('#activity');
const searchEl = document.querySelector('#search');
const detailsEl = document.querySelector('#details');
const detailsBodyEl = document.querySelector('#details-body');
const detailsCloseEl = document.querySelector('#details-close');

const labels = { ready: 'Ready', 'at-risk': 'At risk', 'on-track': 'On track' };

const cards = () => [...releasesEl.querySelectorAll('.release')];
const rovingIndex = () => cards().findIndex((el) => el.getAttribute('tabindex') === '0');

/** Make `index` the single Tab stop of the list and optionally focus it. */
function setRoving(index, focus = false) {
  const list = cards();
  list.forEach((el, i) => el.setAttribute('tabindex', i === index ? '0' : '-1'));
  if (focus) list[index]?.focus();
}
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
      <button type="button" class="details-btn" aria-label="Open details for ${r.name}">Details</button>
      <div class="bar" role="progressbar" aria-valuenow="${r.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${r.name} checklist">
        <span style="width:${r.progress}%"></span>
      </div>
    </li>`;

/** Loads a page. Page 1 replaces the list; later pages append. Returns the index of the first new card. */
async function loadReleases(page = 1) {
  const id = ++requestId;
  const data = await fetch(`/api/releases?page=${page}&perPage=5&q=${encodeURIComponent(searchEl.value)}`).then((r) => r.json());
  if (id !== requestId) return -1;
  const firstNew = page === 1 ? 0 : cards().length;
  const html = data.items.map(card).join('');
  if (page === 1) releasesEl.innerHTML = html;
  else releasesEl.insertAdjacentHTML('beforeend', html);
  // Keep exactly one Tab stop: keep the current one when appending, else use the first card.
  if (page === 1 || rovingIndex() < 0) setRoving(0);
  currentPage = data.page;
  totalPages = data.pages;
  loadMoreEl.hidden = currentPage >= totalPages;
  loadMoreEl.disabled = false;
  return firstNew;
}

loadMoreEl.addEventListener('click', async () => {
  loadMoreEl.disabled = true;
  try {
    const firstNew = await loadReleases(currentPage + 1);
    if (firstNew < 0) return;
    // A disabled or hidden button loses focus; hand it to the first new card on the last page.
    if (loadMoreEl.hidden) setRoving(firstNew, true);
    else loadMoreEl.focus();
  } catch {
    loadMoreEl.disabled = false;
    loadMoreEl.focus();
  }
});

searchEl.addEventListener('input', () => loadReleases(1));

let openerId = null;
let detailsRequest = 0;

async function openDetails(cardEl) {
  const id = ++detailsRequest;
  const r = await fetch(`/api/releases/${cardEl.dataset.id}`).then((res) => res.json());
  if (id !== detailsRequest) return;
  openerId = cardEl.dataset.id;
  detailsBodyEl.innerHTML = `
    <h3 id="details-title">${r.name} <span class="version">v${r.version}</span></h3>
    <p class="meta">${r.owner} · target ${r.target} · ${labels[r.status]} · ${r.progress}% done</p>
    <ul class="checklist">${r.checklist.map((c) => `<li>${c.done ? '✓' : '○'} ${c.text}</li>`).join('')}</ul>`;
  detailsCloseEl.setAttribute('aria-label', `Close details for ${r.name}`);
  detailsEl.hidden = false;
  detailsCloseEl.focus();
}

/** Closes the panel. Focus returns to the list only if it was in the panel (or lost). */
function closeDetails() {
  detailsRequest++;
  const active = document.activeElement;
  const restore = !active || active === document.body || detailsEl.contains(active);
  detailsEl.hidden = true;
  if (restore) {
    const list = cards();
    const index = restoreFocusIndex(list.map((el) => el.dataset.id), openerId, rovingIndex());
    if (index >= 0) setRoving(index, true);
    else searchEl.focus();
  }
  openerId = null;
}

detailsCloseEl.addEventListener('click', closeDetails);

releasesEl.addEventListener('click', (event) => {
  const cardEl = event.target.closest('.release');
  if (cardEl) openDetails(cardEl);
});

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'Escape') {
    if (!detailsEl.hidden) { event.preventDefault(); closeDetails(); }
    return;
  }
  if (event.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'j' || event.key === 'k') {
    if (event.target.closest?.('#details')) return;
    event.preventDefault();
    const list = cards();
    const index = keyFocusTarget(list.indexOf(document.activeElement), rovingIndex(), list.length, event.key);
    if (index >= 0) setRoving(index, true);
  } else if (event.key === 'Enter' && !event.repeat && event.target.classList?.contains('release')) {
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
