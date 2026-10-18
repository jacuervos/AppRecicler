const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = process.cwd();
const configPath = path.join(rootDir, 'stories.config.json');
const reportDir = path.join(rootDir, 'report');
const storiesDir = path.join(reportDir, 'stories');
const pkgPath = path.join(rootDir, 'package.json');
const serviceName = fs.existsSync(pkgPath)
  ? (JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name || path.basename(rootDir))
  : path.basename(rootDir);

if (!fs.existsSync(configPath)) {
  console.error('stories.config.json not found');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const stories = (config.frontendStories || []).filter((story) => story.enabled !== false);

if (stories.length === 0) {
  console.error('No enabled frontend stories in stories.config.json');
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

function parseCloverCoveragePercent(cloverPath) {
  if (!fs.existsSync(cloverPath)) {
    return 100.0;
  }
  const xml = fs.readFileSync(cloverPath, 'utf8');
  const projectMetricsMatch = xml.match(/<project[^>]*>\s*<metrics\s+([^>]+)\/>/);
  const attrsSource = projectMetricsMatch ? projectMetricsMatch[1] : xml;
  const statementsMatch = attrsSource.match(/\bstatements="(\d+)"/);
  const coveredMatch = attrsSource.match(/\bcoveredstatements="(\d+)"/);
  if (!statementsMatch || !coveredMatch) {
    return 100.0;
  }
  const statements = Number(statementsMatch[1]);
  const covered = Number(coveredMatch[1]);
  return statements > 0 ? Number(((covered / statements) * 100).toFixed(1)) : 100.0;
}

function generateStoryTestsHtml(testsHtmlPath, storySummary) {
  const covLabel = storySummary.coveragePercent != null ? `${storySummary.coveragePercent.toFixed(1)}%` : 'Ver reporte';
  const rowsHtml = (storySummary.testCases || []).map((tc) => {
    const isPassed = tc.status === 'passed';
    const badgeClass = isPassed ? 'good' : 'warning';
    const badgeText = isPassed ? 'PASSED' : tc.status.toUpperCase();
    const errorHtml = tc.message
      ? `<pre class="error-box">${escapeHtml(tc.message)}</pre>`
      : '';
    return `
      <tr>
        <td>
          <div class="test-title">${escapeHtml(tc.title)}</div>
          <div class="test-sub">${escapeHtml(tc.suite)}</div>
          ${errorHtml}
        </td>
        <td>${tc.assertions}</td>
        <td>${(tc.durationMs / 1000).toFixed(3)}s</td>
        <td><span class="chip ${badgeClass}">${badgeText}</span></td>
      </tr>`;
  }).join('');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tests - ${escapeHtml(storySummary.title)}</title>
  <style>
    :root { --b:#1d4ed8; --b2:#2563eb; --text:#1f2937; --muted:#6b7280; }
    body { margin:0; font-family: Arial, sans-serif; color:var(--text); background:#f5f7fb; }
    .wrap { max-width:1100px; margin:0 auto; padding:28px 16px 48px; }
    .panel { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; box-shadow:0 8px 24px rgba(15,23,42,.08); margin-bottom:16px; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
    .btn { text-decoration:none; color:#fff; background:linear-gradient(135deg,var(--b),var(--b2)); padding:8px 14px; border-radius:10px; font-weight:700; font-size:.9rem; }
    .btn-outline { text-decoration:none; color:var(--b); background:#e0ecff; border:1px solid #bfdbfe; padding:8px 14px; border-radius:10px; font-weight:700; font-size:.9rem; }
    .grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin-top:14px; }
    .metric { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; text-align:center; }
    .metric b { font-size:1.25rem; display:block; margin-top:4px; }
    .meta { color:var(--muted); margin:4px 0; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th, td { text-align:left; padding:12px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
    th { color:var(--muted); font-size:.85rem; text-transform:uppercase; }
    .test-title { font-weight:700; margin-bottom:4px; }
    .test-sub { color:var(--muted); font-size:.82rem; }
    .chip { padding:5px 10px; border-radius:999px; font-weight:800; font-size:.8rem; display:inline-block; }
    .good { background:rgba(37,99,235,.14); color:#1d4ed8; }
    .warning { background:rgba(239,68,68,.16); color:#b91c1c; }
    .error-box { background:#fef2f2; color:#991b1b; padding:8px; border-radius:8px; font-size:.8rem; margin-top:6px; overflow-x:auto; }
    @media (max-width: 760px) { .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <a class="btn-outline" href="../../../../index.html">← Volver al reporte por Sprints</a>
      <a class="btn" href="coverage/lcov-report/index.html">Abrir Coverage (${covLabel})</a>
    </div>

    <section class="panel">
      <h1>${escapeHtml(serviceName)} · ${escapeHtml(storySummary.title)}</h1>
      <p class="meta">ID: <b>${escapeHtml(storySummary.id)}</b> · Sprint: <b>${storySummary.sprint}</b> · Filtro: <code>${escapeHtml(storySummary.testPathPattern)}</code></p>
      <div class="grid">
        <div class="metric"><small>Tests</small><b>${storySummary.total}</b></div>
        <div class="metric"><small>Passed</small><b>${storySummary.passed}</b></div>
        <div class="metric"><small>Failed</small><b>${storySummary.failed}</b></div>
        <div class="metric"><small>Skipped</small><b>${storySummary.skipped}</b></div>
        <div class="metric"><small>Coverage</small><b><a href="coverage/lcov-report/index.html" style="color:var(--b);text-decoration:none;">${covLabel}</a></b></div>
      </div>
    </section>

    <section class="panel">
      <h2>Casos de prueba ejecutados</h2>
      <table>
        <thead>
          <tr><th>Caso de prueba</th><th>Aserciones</th><th>Tiempo</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4">Sin casos de prueba registrados.</td></tr>'}
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>`;

  fs.writeFileSync(testsHtmlPath, html);
}

fs.rmSync(reportDir, { recursive: true, force: true });
fs.mkdirSync(storiesDir, { recursive: true });

const sprintMap = new Map();
const summary = {
  service: serviceName,
  generatedAt: new Date().toISOString(),
  stories: [],
  sprints: [],
};

for (const story of stories) {
  const sprintNumber = Number(story.sprint ?? 1);
  const sprintKey = `sprint-${sprintNumber}`;

  if (!sprintMap.has(sprintKey)) {
    sprintMap.set(sprintKey, {
      sprint: sprintNumber,
      stories: [],
    });
  }

  const sprintPath = path.join(reportDir, 'sprints', sprintKey, 'stories');
  const storyDir = path.join(sprintPath, story.id);
  const coverageDir = path.join(storyDir, 'coverage');
  const outputFile = path.join(storyDir, 'jest-summary.json');
  const testsHtmlPath = path.join(storyDir, 'tests.html');

  fs.mkdirSync(storyDir, { recursive: true });

  const args = [
    'test',
    '--',
    '--watchAll=false',
    '--watchman=false',
    '--passWithNoTests',
    '--coverage',
    '--runInBand',
    `--testPathPattern=${story.testPathPattern}`,
    `--coverageDirectory=${coverageDir}`,
    '--json',
    `--outputFile=${outputFile}`,
  ];

  console.log(`Running story ${story.id} for sprint ${sprintNumber}...`);
  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' },
  });

  if (result.status !== 0 || !fs.existsSync(outputFile)) {
    console.error(`Story ${story.id} failed tests or 80% minimum coverage threshold.`);
    process.exit(result.status || 1);
  }

  const jestSummary = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const cloverPath = path.join(coverageDir, 'clover.xml');
  const coveragePercent = parseCloverCoveragePercent(cloverPath);

  const testCases = [];
  for (const suite of jestSummary.testResults || []) {
    const suiteName = path.relative(rootDir, suite.name || '');
    for (const assertion of suite.assertionResults || []) {
      testCases.push({
        title: assertion.title || assertion.fullName || 'Test',
        suite: (assertion.ancestorTitles || []).join(' › ') || suiteName,
        status: assertion.status || 'passed',
        durationMs: Number(assertion.duration || 0),
        assertions: Number(assertion.numPassingAsserts || 0),
        message: (assertion.failureMessages || []).join('\n'),
      });
    }
  }

  const storySummary = {
    id: story.id,
    title: story.title,
    sprint: sprintNumber,
    testPathPattern: story.testPathPattern,
    total: jestSummary.numTotalTests,
    passed: jestSummary.numPassedTests,
    failed: jestSummary.numFailedTests,
    skipped: jestSummary.numPendingTests + jestSummary.numTodoTests,
    coveragePercent,
    testsPath: `sprints/${sprintKey}/stories/${story.id}/tests.html`,
    coveragePath: `sprints/${sprintKey}/stories/${story.id}/coverage/lcov-report/index.html`,
    testCases,
  };

  generateStoryTestsHtml(testsHtmlPath, storySummary);

  summary.stories.push(storySummary);
  sprintMap.get(sprintKey).stories.push(storySummary);
}

summary.sprints = Array.from(sprintMap.values()).map((group) => {
  const avgCoverage = group.stories.length > 0
    ? Number((group.stories.reduce((sum, s) => sum + Number(s.coveragePercent ?? 100), 0) / group.stories.length).toFixed(1))
    : 100.0;
  return {
    sprint: group.sprint,
    total: group.stories.reduce((sum, story) => sum + (story.total || 0), 0),
    passed: group.stories.reduce((sum, story) => sum + (story.passed || 0), 0),
    failed: group.stories.reduce((sum, story) => sum + (story.failed || 0), 0),
    skipped: group.stories.reduce((sum, story) => sum + (story.skipped || 0), 0),
    coveragePercent: avgCoverage,
    stories: group.stories,
  };
});

fs.writeFileSync(path.join(reportDir, 'stories-summary.json'), JSON.stringify(summary, null, 2));

require('./generate-story-pages-report');
console.log('Story test reports generated in report/sprints');
