// Sample data only. Timestamps are ISO strings in UTC.
export const releases = [
  { id: 'r-142', name: 'Checkout v3', version: '3.0.0', owner: 'Maya', target: '2026-12-02', checklist: [
    { id: 'c1', text: 'Feature flags reviewed', done: true },
    { id: 'c2', text: 'Load test at 2x peak', done: true },
    { id: 'c3', text: 'Rollback plan signed off', done: false },
    { id: 'c4', text: 'Support briefed', done: false },
  ] },
  { id: 'r-141', name: 'Mobile onboarding', version: '2.4.0', owner: 'Jonas', target: '2026-11-28', checklist: [
    { id: 'c1', text: 'Copy approved', done: true },
    { id: 'c2', text: 'Accessibility audit', done: true },
    { id: 'c3', text: 'Store screenshots', done: true },
  ] },
  { id: 'r-140', name: 'Billing exports', version: '1.9.2', owner: 'Aiko', target: '2026-12-09', checklist: [] },
  { id: 'r-139', name: 'Search ranking', version: '5.1.0', owner: 'Leo', target: '2026-12-16', checklist: [
    { id: 'c1', text: 'Offline evaluation', done: true },
    { id: 'c2', text: 'A/B test plan', done: false },
  ] },
  { id: 'r-138', name: 'Audit log', version: '1.0.0', owner: 'Sara', target: '2026-12-20', checklist: [
    { id: 'c1', text: 'Retention policy', done: false },
    { id: 'c2', text: 'Export format', done: false },
    { id: 'c3', text: 'Security review', done: false },
  ] },
  { id: 'r-137', name: 'Team invites', version: '2.2.1', owner: 'Maya', target: '2026-11-26', checklist: [
    { id: 'c1', text: 'Email templates', done: true },
    { id: 'c2', text: 'Rate limits', done: true },
  ] },
  { id: 'r-136', name: 'Status page', version: '1.3.0', owner: 'Jonas', target: '2026-12-05', checklist: [
    { id: 'c1', text: 'Incident templates', done: true },
    { id: 'c2', text: 'RSS feed', done: false },
  ] },
];

export const activity = [
  { at: '2026-11-24T15:42:00Z', release: 'r-142', text: 'Load test at 2x peak passed' },
  { at: '2026-11-24T13:10:00Z', release: 'r-141', text: 'Store screenshots uploaded' },
  { at: '2026-11-24T09:05:00Z', release: 'r-137', text: 'Rate limits verified in staging' },
  { at: '2026-11-23T17:30:00Z', release: 'r-139', text: 'Offline evaluation shared' },
  { at: '2026-11-22T11:00:00Z', release: 'r-136', text: 'Incident templates merged' },
];
