const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'report');
const summaryPath = path.join(reportDir, 'stories-summary.json');

if (!fs.existsSync(summaryPath)) {
  console.error('stories-summary.json not found. Run scripts/run-story-tests.js first.');
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const stories = summary.stories || [];

const totals = stories.reduce(
  (acc, story) => {
    acc.total += story.total || 0;
    acc.passed += story.passed || 0;
    acc.failed += story.failed || 0;
    acc.skipped += story.skipped || 0;
    return acc;
  },
  { total: 0, passed: 0, failed: 0, skipped: 0 }
);

const passRate = totals.total > 0 ? Math.round((totals.passed / totals.total) * 100) : 100;

const sprintCardsHtml = (summary.sprints || []).map((sprintGroup) => {
  const sprintStoriesHtml = (sprintGroup.stories || []).map((story) => `
    <li>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; width:100%;">
        <span>${story.title}</span>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <strong>${story.passed}/${story.total} passed</strong>
          <a href="${story.coveragePath}" target="_blank" style="color:#1d4ed8; text-decoration:none; font-weight:700;">Coverage</a>
        </div>
      </div>
    </li>
  `).join('');

  return `
    <section class="sprint-panel">
      <div class="sprint-header">
        <h2>Sprint ${sprintGroup.sprint}</h2>
        <span class="pill">${(sprintGroup.stories || []).length} historias</span>
      </div>
      <div class="metrics-grid">
        <div class="metric"><small>Total</small><br><b>${sprintGroup.total}</b></div>
        <div class="metric"><small>Passed</small><br><b>${sprintGroup.passed}</b></div>
        <div class="metric"><small>Failed</small><br><b>${sprintGroup.failed}</b></div>
        <div class="metric"><small>Skipped</small><br><b>${sprintGroup.skipped}</b></div>
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
  <title>Story Report by Sprint</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .hero { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; padding: 24px; border-radius: 18px; margin-bottom: 20px; }
    .hero h1 { margin: 0 0 8px; }
    .meta { opacity: 0.9; margin: 0; }
    .overview { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 18px 0 20px; }
    .card, .sprint-panel { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
    .card { text-align: center; }
    .card small { color: #6b7280; }
    .card b { font-size: 1.7rem; display: block; margin-top: 6px; }
    .sprint-panel { margin-bottom: 18px; }
    .sprint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .sprint-header h2 { margin: 0; }
    .pill { background: #e0ecff; color: #1d4ed8; padding: 6px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
    .metric { background: #f8fafc; border-radius: 10px; padding: 12px; text-align: center; }
    .metric small { color: #6b7280; }
    .metric b { display: block; margin-top: 5px; }
    .story-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .story-list li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 8px; background: #f8fafc; }
    @media (max-width: 700px) { .overview, .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Reporte de historias por sprint</h1>
      <p class="meta">Generado: ${summary.generatedAt}</p>
    </section>

    <div class="overview">
      <div class="card"><small>Historias</small><b>${stories.length}</b></div>
      <div class="card"><small>Passed</small><b>${totals.passed}</b></div>
      <div class="card"><small>Failed</small><b>${totals.failed}</b></div>
      <div class="card"><small>Skipped</small><b>${totals.skipped}</b></div>
    </div>

    ${sprintCardsHtml || `
      <section class="sprint-panel">
        <div class="sprint-header">
          <h2>Historias</h2>
          <span class="pill">${stories.length} historias</span>
        </div>
        <ul class="story-list">
          ${stories.map((story) => `<li><span>${story.title}</span><strong>${story.passed}/${story.total} passed</strong></li>`).join('')}
        </ul>
      </section>
    `}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), html);
console.log('Generated report/index.html');
