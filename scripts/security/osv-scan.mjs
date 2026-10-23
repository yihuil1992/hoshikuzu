import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Validate coverage as well as findings; an empty/partial report is never clean. */
export function inspectReport(report, lockfile) {
  if (!report || !Array.isArray(report.results) || report.results.length !== 1) {
    throw new Error('Expected exactly one scanned lockfile in the OSV report');
  }
  for (const key of ['error', 'errors', 'scan_errors']) {
    if (report[key] && (!Array.isArray(report[key]) || report[key].length)) {
      throw new Error(`OSV reported ${key}`);
    }
  }
  const result = report.results[0];
  if (result.source?.type !== 'lockfile' || !result.source.path ||
      realpathSync(result.source.path) !== realpathSync(lockfile)) {
    throw new Error('OSV report does not cover the requested lockfile');
  }
  if (!Array.isArray(result.packages) || result.packages.length === 0) {
    throw new Error('OSV reported no packages');
  }
  const expectedPackages = [...readFileSync(lockfile, 'utf8').matchAll(/^  version /gm)].length;
  if (!expectedPackages || result.packages.length !== expectedPackages) {
    throw new Error(`Incomplete lockfile coverage: expected ${expectedPackages}, received ${result.packages.length}`);
  }
  const advisories = new Set();
  let affectedPackages = 0;
  for (const item of result.packages) {
    if (!item.package?.name || !item.package.version || item.package.ecosystem !== 'npm') {
      throw new Error('Invalid npm package record in OSV report');
    }
    if (item.vulnerabilities !== undefined && !Array.isArray(item.vulnerabilities)) {
      throw new Error('Invalid vulnerability records in OSV report');
    }
    if (item.vulnerabilities?.length) affectedPackages++;
    for (const vulnerability of item.vulnerabilities || []) {
      if (!vulnerability.id) throw new Error('Vulnerability without an advisory ID');
      advisories.add(vulnerability.id);
    }
  }
  return { packages: result.packages.length, affectedPackages, advisoryIds: [...advisories].sort() };
}

export function runScan({ scanner = process.env.OSV_SCANNER || 'osv-scanner',
  lockfile = 'yarn.lock', outputDir = 'tmp/security/osv', timeoutMs = 180000,
  launch = spawnSync } = {}) {
  mkdirSync(outputDir, { recursive: true });
  // A fresh run directory prevents stale clean reports from hiding scanner failures.
  const runDir = mkdtempSync(path.join(path.resolve(outputDir), 'run-'));
  const reportFile = path.join(runDir, 'osv.json');
  const configFile = path.join(runDir, 'osv-scanner.toml');
  writeFileSync(configFile, '# Intentionally empty: no advisory suppressions.\n');
  const summary = { startedAt: new Date().toISOString(), scanner, lockfile: path.resolve(lockfile), runDir,
    scannerExitCode: null, status: 'error', exitCode: 2 };
  try {
    const input = realpathSync(lockfile);
    if (!readFileSync(input, 'utf8').includes('# yarn lockfile v1')) throw new Error('Expected a Yarn v1 lockfile');
    const args = ['scan', 'source', '--lockfile', input, '--config', configFile,
      '--no-call-analysis', '--no-resolve', '--all-packages', '--all-vulns',
      '--format', 'json', '--output-file', reportFile];
    summary.command = { executable: scanner, args };
    const child = launch(scanner, args, { encoding: 'utf8', timeout: timeoutMs,
      maxBuffer: 64 * 1024 * 1024, windowsHide: true, shell: false });
    writeFileSync(path.join(runDir, 'stdout.log'), child.stdout || '');
    writeFileSync(path.join(runDir, 'stderr.log'), child.stderr || '');
    summary.scannerExitCode = child.status;
    if (child.error) throw child.error;
    if (child.signal || ![0, 1].includes(child.status)) {
      throw new Error(`OSV failed (exit=${child.status}, signal=${child.signal || 'none'})`);
    }
    Object.assign(summary, inspectReport(JSON.parse(readFileSync(reportFile, 'utf8')), input));
    const findings = summary.advisoryIds.length > 0;
    if ((child.status === 1) !== findings) throw new Error('OSV exit code and findings disagree');
    summary.status = findings ? 'vulnerable' : 'clean';
    summary.exitCode = findings ? 1 : 0;
  } catch (error) {
    summary.error = error.message;
    writeFileSync(path.join(runDir, 'error.log'), `${error.stack || error}\n`);
  }
  summary.finishedAt = new Date().toISOString();
  writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = {};
  const allowed = { '--lockfile': 'lockfile', '--output-dir': 'outputDir', '--scanner': 'scanner' };
  try {
    for (let i = 2; i < process.argv.length; i += 2) {
      const key = allowed[process.argv[i]], value = process.argv[i + 1];
      if (!key || !value || value.startsWith('--')) throw new Error(`Invalid argument: ${process.argv[i]}`);
      options[key] = value;
    }
    const summary = runScan(options);
    console.log(JSON.stringify(summary, null, 2));
    process.exitCode = summary.exitCode;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
