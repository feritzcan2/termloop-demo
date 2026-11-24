const releasesEl = document.querySelector('#releases');
const pagerEl = document.querySelector('#pager');
const activityEl = document.querySelector('#activity');
const searchEl = document.querySelector('#search');

const labels = { ready: 'Ready', 'at-risk': 'At risk', 'on-track': 'On track' };

async function loadReleases(page = 1) {
  const data = await fetch(`/api/releases?page=${page}&q=${encodeURIComponent(searchEl.value)}`).then((r) => r.json());
  releasesEl.innerHTML = data.items.map((r) => `
    <li class="release">
      <div class="release-head">
        <strong>${r.name}</strong> <span class="version">v${r.version}</span>
        <span class="badge ${r.status}">${labels[r.status]}</span>
      </div>
      <div class="meta">${r.owner} · target ${r.target}</div>
      ${r.checklist.length === 0 ? '<div class="meta empty-checklist">No checklist yet</div>' : `<div class="bar" role="progressbar" aria-valuenow="${r.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${r.name} checklist">
        <span style="width:${r.progress}%"></span>
      </div>`}
    </li>`).join('');
  pagerEl.innerHTML = Array.from({ length: data.pages }, (_, i) =>
    `<button type="button" data-page="${i + 1}" ${i + 1 === data.page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('');
}

pagerEl.addEventListener('click', (event) => {
  const page = event.target.dataset?.page;
  if (page) loadReleases(Number(page));
});

searchEl.addEventListener('input', () => loadReleases(1));

async function loadActivity() {
  const entries = await fetch('/api/activity').then((r) => r.json());
  activityEl.innerHTML = entries.map((e) => `<li><time datetime="${e.at}">${e.when}</time> ${e.text}</li>`).join('');
}

loadReleases();
loadActivity();
