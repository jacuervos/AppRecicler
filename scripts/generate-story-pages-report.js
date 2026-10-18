const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'report');
const summaryPath = path.join(reportDir, 'stories-summary.json');

if (!fs.existsSync(summaryPath)) {
  console.error('stories-summary.json not found. Run scripts/run-story-tests.js first.');
  process.exit(1);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const stories = summary.stories || [];
const serviceName = summary.service || path.basename(rootDir);

const totals = stories.reduce(
  (acc, story) => {
    acc.total += story.total || 0;
    acc.passed += story.passed || 0;
    acc.failed += story.failed || 0;
    acc.skipped += story.skipped || 0;
    acc.coverageSum += Number(story.coveragePercent ?? 100);
    return acc;
  },
  { total: 0, passed: 0, failed: 0, skipped: 0, coverageSum: 0 }
);

const avgCoverage = stories.length > 0 ? (totals.coverageSum / stories.length).toFixed(1) : '100.0';

const sprintCardsHtml = (summary.sprints || []).map((sprintGroup) => {
  const sprintStories = sprintGroup.stories || [];
  const sprintCoverage = sprintGroup.coveragePercent != null
    ? Number(sprintGroup.coveragePercent).toFixed(1)
    : (sprintStories.length > 0
      ? (sprintStories.reduce((s, st) => s + Number(st.coveragePercent ?? 100), 0) / sprintStories.length).toFixed(1)
      : '100.0');

  const sprintStoriesHtml = sprintStories.map((story) => {
    const covBadge = story.coveragePercent != null
      ? `Coverage (${Number(story.coveragePercent).toFixed(1)}%)`
      : 'Coverage';
    const testsHref = story.testsPath || story.coveragePath;
    return `
    <li>
      <div class="story-info">
        <a class="story-title" href="${escapeHtml(testsHref)}">${escapeHtml(story.title)}</a>
        <span class="story-meta">ID: <b>${escapeHtml(story.id)}</b> · Filtro: <code>${escapeHtml(story.testPathPattern || '')}</code></span>
      </div>
      <div class="story-actions">
        <strong>${story.passed}/${story.total} passed</strong>
        ${story.testsPath ? `<a class="link-btn" href="${escapeHtml(story.testsPath)}">Ver tests</a>` : ''}
        <a class="link-btn cov" href="${escapeHtml(story.coveragePath)}">${escapeHtml(covBadge)}</a>
      </div>
    </li>`;
  }).join('');

  return `
    <section class="sprint-panel">
      <div class="sprint-header">
        <h2>Sprint ${sprintGroup.sprint}</h2>
        <span class="pill">${sprintStories.length} historias · Coverage ${sprintCoverage}%</span>
      </div>
      <div class="metrics-grid">
        <div class="metric"><small>Total Tests</small><br><b>${sprintGroup.total}</b></div>
        <div class="metric"><small>Passed</small><br><b>${sprintGroup.passed}</b></div>
        <div class="metric"><small>Failed</small><br><b>${sprintGroup.failed}</b></div>
        <div class="metric"><small>Coverage</small><br><b>${sprintCoverage}%</b></div>
      </div>
      <ul class="story-list">${sprintStoriesHtml}</ul>
    </section>
  `;
}).join('');

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(serviceName)} - Story Report by Sprint</title>
  <style>
    :root { --b:#1d4ed8; --b2:#2563eb; --text:#1f2937; --muted:#6b7280; }
    body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; color: var(--text); }
    .wrap { max-width: 1150px; margin: 0 auto; padding: 24px 16px 40px; }
    .hero { background: linear-gradient(135deg, var(--b), var(--b2)); color: white; padding: 24px; border-radius: 18px; margin-bottom: 20px; box-shadow: 0 10px 28px rgba(29, 78, 216, 0.18); }
    .hero h1 { margin: 0 0 8px; }
    .meta { opacity: 0.9; margin: 0; }
    .overview { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 18px 0 20px; }
    .card, .sprint-panel { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
    .card { text-align: center; }
    .card small { color: var(--muted); }
    .card b { font-size: 1.55rem; display: block; margin-top: 6px; }
    .sprint-panel { margin-bottom: 18px; }
    .sprint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .sprint-header h2 { margin: 0; }
    .pill { background: #e0ecff; color: var(--b); padding: 6px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center; }
    .metric small { color: var(--muted); }
    .metric b { display: block; margin-top: 5px; font-size: 1.15rem; }
    .story-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .story-list li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e7eb; flex-wrap: wrap; }
    .story-info { display: flex; flex-direction: column; gap: 4px; }
    .story-title { color: var(--text); font-weight: 800; text-decoration: none; font-size: 1rem; }
    .story-title:hover { color: var(--b); text-decoration: underline; }
    .story-meta { color: var(--muted); font-size: 0.82rem; }
    .story-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .link-btn { text-decoration: none; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: #e0ecff; color: var(--b); border: 1px solid #bfdbfe; }
    .link-btn.cov { background: linear-gradient(135deg, var(--b), var(--b2)); color: #fff; border: none; }
    .link-btn:hover { opacity: 0.92; }
    @media (max-width: 760px) { .overview, .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>${escapeHtml(serviceName)} · Reporte de historias por sprint</h1>
      <p class="meta">Generado: ${escapeHtml(summary.generatedAt)}</p>
    </section>

    <div class="overview">
      <div class="card"><small>Historias</small><b>${stories.length}</b></div>
      <div class="card"><small>Total Tests</small><b>${totals.total}</b></div>
      <div class="card"><small>Passed</small><b>${totals.passed}</b></div>
      <div class="card"><small>Failed</small><b>${totals.failed}</b></div>
      <div class="card"><small>Coverage Promedio</small><b>${avgCoverage}%</b></div>
    </div>

    ${sprintCardsHtml}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), html);
console.log('Generated report/index.html');
