const releasesEl = document.querySelector('#releases');
const loadMoreEl = document.querySelector('#load-more');
const activityEl = document.querySelector('#activity');
const searchEl = document.querySelector('#search');

const labels = { ready: 'Ready', 'at-risk': 'At risk', 'on-track': 'On track' };

let currentPage = 1;
let totalPages = 1;
let requestId = 0;

const card = (r) => `
    <li class="release">
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

async function loadActivity() {
  const entries = await fetch('/api/activity').then((r) => r.json());
  activityEl.innerHTML = entries.map((e) => `<li><time datetime="${e.at}">${e.when}</time> ${e.text}</li>`).join('');
}

loadReleases();
loadActivity();
