const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = process.cwd();
const configPath = path.join(rootDir, 'stories.config.json');
const reportDir = path.join(rootDir, 'report');
const storiesDir = path.join(reportDir, 'stories');

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

fs.rmSync(reportDir, { recursive: true, force: true });
fs.mkdirSync(storiesDir, { recursive: true });

const sprintMap = new Map();
const summary = {
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

  if (!fs.existsSync(outputFile)) {
    process.exit(result.status || 1);
  }

  const jestSummary = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  const storySummary = {
    id: story.id,
    title: story.title,
    sprint: sprintNumber,
    testPathPattern: story.testPathPattern,
    total: jestSummary.numTotalTests,
    passed: jestSummary.numPassedTests,
    failed: jestSummary.numFailedTests,
    skipped: jestSummary.numPendingTests + jestSummary.numTodoTests,
    coveragePath: `sprints/${sprintKey}/stories/${story.id}/coverage/lcov-report/index.html`,
  };

  summary.stories.push(storySummary);
  sprintMap.get(sprintKey).stories.push(storySummary);
}

summary.sprints = Array.from(sprintMap.values()).map((group) => ({
  sprint: group.sprint,
  total: group.stories.reduce((sum, story) => sum + (story.total || 0), 0),
  passed: group.stories.reduce((sum, story) => sum + (story.passed || 0), 0),
  failed: group.stories.reduce((sum, story) => sum + (story.failed || 0), 0),
  skipped: group.stories.reduce((sum, story) => sum + (story.skipped || 0), 0),
  stories: group.stories,
}));

fs.writeFileSync(path.join(reportDir, 'stories-summary.json'), JSON.stringify(summary, null, 2));

const totalStories = summary.stories.length;
const totalPassed = summary.stories.reduce((sum, story) => sum + (story.passed || 0), 0);
const totalFailed = summary.stories.reduce((sum, story) => sum + (story.failed || 0), 0);
const totalSkipped = summary.stories.reduce((sum, story) => sum + (story.skipped || 0), 0);

const sprintCardsHtml = (summary.sprints || []).map((sprintGroup) => {
  const sprintStoriesHtml = (sprintGroup.stories || []).map((story) => `
    <li>
      <span>${story.title}</span>
      <strong>${story.passed}/${story.total} passed</strong>
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
      <p class="meta">Generado: ${new Date().toISOString()}</p>
    </section>

    <div class="overview">
      <div class="card"><small>Historias</small><b>${totalStories}</b></div>
      <div class="card"><small>Passed</small><b>${totalPassed}</b></div>
      <div class="card"><small>Failed</small><b>${totalFailed}</b></div>
      <div class="card"><small>Skipped</small><b>${totalSkipped}</b></div>
    </div>

    ${sprintCardsHtml}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), html);
console.log('Story test reports generated in report/sprints');
