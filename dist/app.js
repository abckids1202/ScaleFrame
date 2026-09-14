const domainData = {
  WIS: {
    count: '09 METRICS',
    rows: [
      ['Attack potency', 'Damage output in context', 'Baku', '0.84', 'baku'],
      ['Combat speed', 'Reaction + exchange tempo', 'Baku', '0.71', 'baku'],
      ['Abilities', 'Useful, reliable win tools', 'Johan', '0.88', 'johan'],
      ['Battle IQ', 'Reading the fight state', 'Baku', '0.83', 'baku'],
      ['Win conditions', 'Routes that close the match', 'Baku', '0.82', 'baku'],
      ['Resistances', 'Answers to the opponent', 'Johan', '0.75', 'johan'],
    ],
    selected: { title: 'Planning', definition: 'The ability to sequence goals, contingencies, and resources across a changing situation.', winner: 'Baku Madarame', evidence: 'The Kagerou Club arc shows layered plans that stay functional after the first read is exposed.', source: 'Usogui · ch. 386–391', token: 'PLANNING' }
  },
  SCD: {
    count: '12 METRICS',
    rows: [
      ['Deduction', 'Inference from incomplete information', 'Baku', '0.91', 'baku'],
      ['Contingency planning', 'Branches after disruption', 'Baku', '0.86', 'baku'],
      ['Deception', 'Misdirection + false signals', 'Johan', '0.91', 'johan'],
      ['Prediction', 'Forecasting an opponent’s line', 'Baku', '0.79', 'baku'],
      ['Psychological warfare', 'Pressure that changes choices', 'Johan', '0.87', 'johan'],
      ['Adaptability', 'Updating under new information', 'Baku', '0.84', 'baku'],
    ],
    selected: { title: 'Contingency planning', definition: 'The ability to anticipate disruption and preserve a winning route when the first plan becomes visible.', winner: 'Baku Madarame', evidence: 'Baku builds false branches into the gamble so an opponent’s correct read still feeds the next move.', source: 'Usogui · ch. 479–481', token: 'CONTINGENCY' }
  },
  WW: {
    count: '10 METRICS',
    rows: [
      ['Characterization', 'Clarity + depth of construction', 'Johan', '0.89', 'johan'],
      ['Psychology', 'Interior logic and contradiction', 'Johan', '0.93', 'johan'],
      ['Dynamics', 'Relational dramatic energy', 'Baku', '0.78', 'baku'],
      ['Thematic integration', 'Ideas carried by the character', 'Johan', '0.86', 'johan'],
      ['Dialogue', 'Voice, subtext, and control', 'Johan', '0.88', 'johan'],
      ['Peaks', 'Strength of highest moments', 'Baku', '0.76', 'baku'],
    ],
    selected: { title: 'Psychology', definition: 'The depth, consistency, and dramatic usefulness of a character’s inner life and contradictions.', winner: 'Johan Liebert', evidence: 'Johan’s self-erasure operates as both motive and method, keeping his interiority legible without making it simple.', source: 'Monster · vol. 1–18', token: 'PSYCHOLOGY' }
  }
};

let activeDomain = 'WIS';
let selectedTitle = 'Planning';
let toastTimer;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function renderDomain(domain, preserveSelection = false) {
  activeDomain = domain;
  const data = domainData[domain];
  $$('#category-table').forEach(() => {});
  const table = $('#category-table');
  table.innerHTML = data.rows.map((row) => `
    <button class="category-row ${row[0].toLowerCase() === selectedTitle.toLowerCase() ? 'selected' : ''}" type="button" data-category="${row[0]}" data-winner="${row[2]}" data-definition="${row[1]}" data-confidence="${row[3]}" data-tone="${row[4]}">
      <span class="category-name">${row[0]}</span><span class="category-definition">${row[1]}</span><span class="winner ${row[4] === 'johan' ? 'johan' : ''}">${row[2]}</span><span class="confidence">${row[3]}</span>
    </button>`).join('');
  $('#metric-count').textContent = data.count;
  $$('.domain-tab').forEach(tab => {
    const isActive = tab.dataset.domain === domain;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  if (!preserveSelection || !data.rows.some(row => row[0].toLowerCase() === selectedTitle.toLowerCase())) {
    selectedTitle = data.selected.title;
  }
  const selected = data.rows.find(row => row[0].toLowerCase() === selectedTitle.toLowerCase());
  updateInspector(selected ? {
    title: selected[0], definition: selected[1], winner: selected[2], confidence: selected[3], tone: selected[4],
    evidence: data.selected.evidence, source: data.selected.source, token: selected[0].toUpperCase()
  } : data.selected);
  bindCategoryRows();
}

function bindCategoryRows() {
  $$('.category-row').forEach(row => row.addEventListener('click', () => {
    selectedTitle = row.dataset.category;
    $$('.category-row').forEach(item => item.classList.toggle('selected', item === row));
    const source = domainData[activeDomain].selected;
    updateInspector({ title: row.dataset.category, definition: row.dataset.definition, winner: row.dataset.winner, confidence: row.dataset.confidence, tone: row.dataset.tone, evidence: source.evidence, source: source.source, token: row.dataset.category.toUpperCase() });
  }));
}

function updateInspector(item) {
  const body = $('#inspector-body');
  const isJohan = item.tone === 'johan' || item.winner.includes('Johan');
  body.innerHTML = `
    <span class="selected-category-label">${activeDomain} / SELECTED CATEGORY</span>
    <h4>${item.title}</h4>
    <p class="inspector-definition">${item.definition}</p>
    <div class="winner-callout"><span>CURRENT WINNER</span><strong style="color:${isJohan ? 'var(--cyan)' : 'var(--orange-soft)'}">${item.winner}</strong></div>
    <div class="evidence-label"><span>LINKED EVIDENCE</span><span>${item.confidence || '0.84'} CONFIDENCE</span></div>
    <div class="evidence-note"><span class="evidence-mark">↳</span><p>${item.evidence || 'Evidence can be attached to this category as a claim, feat, statement, or counterargument.'}<br /><small>${item.source || 'Source note · creator reasoning'}</small></p></div>`;
  $('#edit-category').textContent = item.token || item.title.toUpperCase();
  $('#edit-winner').textContent = `${isJohan ? 'JOHAN' : 'BAKU'} WINS`;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

function openNewComparison() {
  const modal = $('#new-comparison-modal');
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
}

function createComparison(event) {
  if (event.submitter?.value !== 'create') return;
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const title = data.get('title');
  const participantA = data.get('participantA');
  const participantB = data.get('participantB');
  const domain = data.get('domain');
  $('#comparison-title').innerHTML = `${participantA} <span>vs</span> ${participantB}`;
  $('#comparison-subtitle').textContent = `${title} · Draft object ready for rules and evidence.`;
  $('#status-chip').textContent = 'DRAFT SAVED';
  $('#save-state').textContent = 'SAVED JUST NOW';
  const modal = $('#new-comparison-modal');
  if (modal.open) modal.close();
  renderDomain(domain);
  document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Draft created. Your argument has a home.');
}

function addCategory() {
  const table = $('#category-table');
  if (table.querySelector('[data-category="New metric"]')) { showToast('That experimental metric is already in the ledger.'); return; }
  const row = document.createElement('button');
  row.className = 'category-row selected';
  row.type = 'button';
  row.dataset.category = 'New metric'; row.dataset.winner = 'Unresolved'; row.dataset.definition = 'A private metric awaiting a definition and evidence.'; row.dataset.confidence = '—'; row.dataset.tone = '';
  row.innerHTML = '<span class="category-name">New metric</span><span class="category-definition">Define before publishing</span><span class="winner">Unresolved</span><span class="confidence">—</span>';
  table.appendChild(row);
  selectedTitle = 'New metric';
  bindCategoryRows();
  row.click();
  showToast('Experimental metric added. Define it before publishing.');
}

function publishDraft() {
  $('#status-chip').textContent = 'PUBLISHED';
  $('#status-chip').classList.add('published');
  $('#save-state').textContent = 'PUBLISHED JUST NOW';
  showToast('Comparison published to your private beta profile.');
}

document.addEventListener('click', (event) => {
  const domainTab = event.target.closest('[data-domain]');
  if (domainTab) { selectedTitle = domainData[domainTab.dataset.domain].selected.title; renderDomain(domainTab.dataset.domain); return; }
  const domainLink = event.target.closest('[data-domain-link]');
  if (domainLink) { selectedTitle = domainData[domainLink.dataset.domain].selected.title; setTimeout(() => renderDomain(domainLink.dataset.domain), 20); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const type = action.dataset.action;
  if (type === 'new-comparison') openNewComparison();
  if (type === 'add-category') addCategory();
  if (type === 'publish') publishDraft();
  if (type === 'toast') showToast(action.dataset.message || 'Saved to the comparison object.');
  if (type === 'search') showToast('Search is scoped to the public library in the next build.');
  if (type === 'signin') showToast('Sign-in is coming with the account layer.');
  if (type === 'clear-inspector') { selectedTitle = domainData[activeDomain].selected.title; renderDomain(activeDomain); }
  if (type === 'play') { action.classList.toggle('playing'); action.textContent = action.classList.contains('playing') ? 'Ⅱ' : '▶'; showToast(action.classList.contains('playing') ? 'Preview playing · 00:06' : 'Preview paused'); }
  if (type === 'add-layer') showToast('Text layer added to the 9:16 composition.');
  if (type === 'scroll') document.querySelector(action.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
});

$('#new-comparison-form').addEventListener('submit', createComparison);
renderDomain('WIS');
