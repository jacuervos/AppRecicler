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

  if (result.status !== 0) {
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
console.log('Story test reports generated in report/sprints');
