const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildDistribution } = require('./build.cjs');

test('distribution ZIP extracts to a runnable page and excludes development files', (context) => {
  const projectDirectory = mkdtempSync(join(tmpdir(), "calendar package ' "));
  context.after(() =>
    rmSync(projectDirectory, { recursive: true, force: true }),
  );
  const filenames = [
    'index.html',
    'calendar_to_call.js',
    'calendar-demo.js',
    'calendar_to_call.css',
  ];
  for (const filename of filenames) {
    writeFileSync(
      join(projectDirectory, filename),
      readFileSync(join(__dirname, filename)),
    );
  }
  writeFileSync(join(projectDirectory, 'private-development.txt'), 'excluded');
  mkdirSync(join(projectDirectory, 'dist'));
  writeFileSync(join(projectDirectory, 'dist', 'stale.txt'), 'excluded');
  const output = buildDistribution(projectDirectory);
  // 同じ出力先に再生成できることも確認します。
  buildDistribution(projectDirectory);
  const extractedDirectory = join(projectDirectory, 'extracted');
  execFileSync(
    process.platform === 'win32' ? 'powershell.exe' : 'pwsh',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "$ErrorActionPreference = 'Stop'; Expand-Archive -LiteralPath $env:CALENDAR_TEST_ARCHIVE -DestinationPath $env:CALENDAR_TEST_EXTRACTED",
    ],
    {
      env: {
        ...process.env,
        CALENDAR_TEST_ARCHIVE: output.archive,
        CALENDAR_TEST_EXTRACTED: extractedDirectory,
      },
    },
  );
  assert.deepEqual(readdirSync(extractedDirectory).sort(), filenames.sort());
  for (const filename of filenames) {
    assert.deepEqual(
      readFileSync(join(extractedDirectory, filename)),
      readFileSync(join(projectDirectory, filename)),
    );
    assert.deepEqual(
      readFileSync(join(output.directory, filename)),
      readFileSync(join(projectDirectory, filename)),
    );
  }
});

test('missing source fails explicitly before creating output', (context) => {
  const projectDirectory = mkdtempSync(join(tmpdir(), 'calendar-missing-'));
  context.after(() =>
    rmSync(projectDirectory, { recursive: true, force: true }),
  );
  assert.throws(
    () => buildDistribution(projectDirectory),
    /Missing distribution source: index.html/,
  );
  assert.deepEqual(readdirSync(projectDirectory), []);
});
