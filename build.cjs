const { copyFileSync, mkdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');

const distributionFiles = [
  'index.html',
  'calendar_to_call.js',
  'calendar-demo.js',
  'calendar_to_call.css',
];

/**
 * 実行用ファイル4点と、それらを直下に含むZIPをdistへ出力します。
 * 開発用ファイルや既存のdist内ファイルはZIPに含めません。
 * @param {string} projectDirectory - ソースを含むプロジェクトの絶対パス。
 * @returns {{directory: string, archive: string}} 出力先。
 */
function buildDistribution(projectDirectory) {
  // コピー前に全入力を確認し、入力不足による部分的な更新を防ぎます。
  for (const filename of distributionFiles) {
    if (!existsSync(join(projectDirectory, filename))) {
      throw new Error('Missing distribution source: ' + filename);
    }
  }
  const directory = join(projectDirectory, 'dist');
  const archive = join(directory, 'calendar-to-call.zip');
  mkdirSync(directory, { recursive: true });
  for (const filename of distributionFiles) {
    copyFileSync(join(projectDirectory, filename), join(directory, filename));
  }
  // PowerShell標準のZIP機能を使用。パスは環境変数で渡し、コマンドに埋め込みません。
  execFileSync(
    process.platform === 'win32' ? 'powershell.exe' : 'pwsh',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      "$ErrorActionPreference = 'Stop'; $paths = @('index.html', 'calendar_to_call.js', 'calendar-demo.js', 'calendar_to_call.css') | ForEach-Object { Join-Path $env:CALENDAR_DISTRIBUTION_DIRECTORY $_ }; Compress-Archive -LiteralPath $paths -DestinationPath $env:CALENDAR_DISTRIBUTION_ARCHIVE -Force",
    ],
    {
      env: {
        ...process.env,
        CALENDAR_DISTRIBUTION_DIRECTORY: directory,
        CALENDAR_DISTRIBUTION_ARCHIVE: archive,
      },
      stdio: 'pipe',
    },
  );
  return { directory, archive };
}

if (require.main === module) {
  buildDistribution(__dirname);
}

module.exports = { buildDistribution };
