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

const summary = {
  generatedAt: new Date().toISOString(),
  stories: [],
};

for (const story of stories) {
  const storyDir = path.join(storiesDir, story.id);
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

  console.log(`Running story ${story.id}...`);
  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  const jestSummary = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

  summary.stories.push({
    id: story.id,
    title: story.title,
    testPathPattern: story.testPathPattern,
    total: jestSummary.numTotalTests,
    passed: jestSummary.numPassedTests,
    failed: jestSummary.numFailedTests,
    skipped: jestSummary.numPendingTests + jestSummary.numTodoTests,
    coveragePath: `stories/${story.id}/coverage/lcov-report/index.html`,
  });
}

fs.writeFileSync(path.join(reportDir, 'stories-summary.json'), JSON.stringify(summary, null, 2));
console.log('Story test reports generated in report/stories');
