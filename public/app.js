const releasesEl = document.querySelector('#releases');
const pagerEl = document.querySelector('#pager');
const activityEl = document.querySelector('#activity');
const searchEl = document.querySelector('#search');
const ownerEl = document.querySelector('#owner');
import { ownersOf, filterByOwner, ownerFromSearch, withOwner } from './owner-filter.js';

const labels = { ready: 'Ready', 'at-risk': 'At risk', 'on-track': 'On track' };

const fetchPage = (page) => fetch(`/api/releases?page=${page}&q=${encodeURIComponent(searchEl.value)}`).then((r) => r.json());

async function fetchAll() {
  const first = await fetchPage(1);
  const rest = await Promise.all(Array.from({ length: first.pages - 1 }, (_, i) => fetchPage(i + 2)));
  return [first, ...rest].flatMap((d) => d.items);
}

async function loadReleases(page = 1) {
  const owner = ownerEl.value;
  // With an owner selected, load every page and filter client-side so matches on later pages show up.
  const data = owner
    ? { items: filterByOwner(await fetchAll(), owner), page: 1, pages: 1 }
    : await fetchPage(page);
  releasesEl.innerHTML = data.items.map((r) => `
    <li class="release">
      <div class="release-head">
        <strong>${r.name}</strong> <span class="version">v${r.version}</span>
        <span class="badge ${r.status}">${labels[r.status]}</span>
      </div>
      <div class="meta">${r.owner} · target ${r.target}</div>
      ${r.checklist.length === 0 ? `<div class="meta empty-checklist">${r.progressLabel}</div>` : `<div class="meta progress-label">${r.progressLabel}</div><div class="bar" role="progressbar" aria-valuenow="${r.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${r.name} checklist">
        <span style="width:${r.progress}%"></span>
      </div>`}
    </li>`).join('');
  pagerEl.innerHTML = data.pages <= 1 ? '' : Array.from({ length: data.pages }, (_, i) =>
    `<button type="button" data-page="${i + 1}" ${i + 1 === data.page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('');
}

pagerEl.addEventListener('click', (event) => {
  const page = event.target.dataset?.page;
  if (page) loadReleases(Number(page));
});

searchEl.addEventListener('input', () => loadReleases(1));

ownerEl.addEventListener('change', () => {
  history.replaceState(null, '', withOwner(location.search, ownerEl.value) || location.pathname);
  loadReleases(1);
});

async function initOwners() {
  const wanted = ownerFromSearch(location.search);
  const owners = ownersOf(await fetchAll());
  for (const name of owners) ownerEl.append(new Option(name, name));
  if (wanted && !owners.includes(wanted)) ownerEl.append(new Option(wanted, wanted));
  ownerEl.value = wanted;
}

async function loadActivity() {
  const entries = await fetch('/api/activity').then((r) => r.json());
  activityEl.innerHTML = entries.map((e) => `<li><time datetime="${e.at}">${e.when}</time> ${e.text}</li>`).join('');
}

initOwners().then(() => loadReleases());
loadActivity();
