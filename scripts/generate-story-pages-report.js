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

const storyCards = stories
  .map((story) => {
    const statusClass = story.failed > 0 ? 'warning' : 'good';
    const statusLabel = story.failed > 0 ? 'Needs attention' : 'Healthy';

    return `
      <article class="card">
        <div>
          <h3>${story.title}</h3>
          <p class="meta">ID: ${story.id}</p>
          <p class="meta">Pattern: ${story.testPathPattern}</p>
        </div>
        <div class="stats">
          <span>${story.passed}/${story.total} passed</span>
          <span>${story.failed} failed</span>
          <span>${story.skipped} skipped</span>
        </div>
        <div class="row">
          <span class="chip ${statusClass}">${statusLabel}</span>
          <a class="btn" href="${story.coveragePath}">Open coverage</a>
        </div>
      </article>
    `;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AppRecicler Story Report</title>
  <style>
    :root { --g:#2e7d32; --g2:#4caf50; --bg:#f5fbf5; --text:#1f2937; --muted:#6b7280; }
    body { margin:0; font-family: Nunito, Arial, sans-serif; color:var(--text); background:linear-gradient(180deg,#f8fff8 0,#eef8ef 100%); }
    .wrap { max-width:1100px; margin:0 auto; padding:28px 16px 40px; }
    .hero { background:#fff; border:1px solid #d9edd9; border-radius:20px; padding:22px; box-shadow:0 10px 28px rgba(46,125,50,.1); }
    h1 { margin:0 0 8px; }
    .muted { color:var(--muted); margin:0; }
    .grid { margin-top:16px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
    .metric { background:#fff; border:1px solid #d9edd9; border-radius:14px; padding:12px; }
    .metric b { font-size:1.25rem; }
    .stories { margin-top:16px; display:grid; gap:12px; }
    .card { background:#fff; border:1px solid #d9edd9; border-radius:16px; padding:14px; display:grid; gap:8px; }
    .card h3 { margin:0; }
    .meta { margin:0; color:var(--muted); font-size:.92rem; }
    .stats { display:flex; gap:12px; flex-wrap:wrap; font-weight:700; }
    .row { display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .chip { padding:6px 10px; border-radius:999px; font-weight:800; font-size:.84rem; }
    .chip.good { background:rgba(76,175,80,.16); color:#1e7e34; }
    .chip.warning { background:rgba(255,152,0,.16); color:#b76a00; }
    .btn { text-decoration:none; color:white; background:linear-gradient(135deg,var(--g),var(--g2)); padding:8px 12px; border-radius:10px; font-weight:800; }
    @media (max-width: 800px) { .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width: 520px) { .grid { grid-template-columns:1fr; } .row { flex-direction:column; align-items:flex-start; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>AppRecicler - Story Report</h1>
      <p class="muted">Generated at ${summary.generatedAt}</p>
      <div class="grid">
        <div class="metric"><small>Total tests</small><br><b>${totals.total}</b></div>
        <div class="metric"><small>Passed</small><br><b>${totals.passed}</b></div>
        <div class="metric"><small>Failed</small><br><b>${totals.failed}</b></div>
        <div class="metric"><small>Pass rate</small><br><b>${passRate}%</b></div>
      </div>
    </section>
    <section class="stories">
      ${storyCards}
    </section>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), html);
console.log('Generated report/index.html');
