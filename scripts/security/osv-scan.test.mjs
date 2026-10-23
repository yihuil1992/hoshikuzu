import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runScan } from './osv-scan.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'hoshikuzu-osv-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const lockfile = path.join(root, 'yarn.lock');
  writeFileSync(lockfile, '# yarn lockfile v1\n\nexample@^1.0.0:\n  version "1.0.0"\n');
  const report = { results: [{ source: { type: 'lockfile', path: lockfile },
    packages: [{ package: { name: 'example', version: '1.0.0', ecosystem: 'npm' } }] }] };
  return { root, lockfile, report, outputDir: path.join(root, 'reports') };
}

function fakeScanner(report, status = 0, extra = {}) {
  return (_executable, args, options) => {
    assert.equal(options.shell, false);
    assert.ok(options.timeout > 0);
    assert.ok(args.includes('--all-packages'));
    assert.ok(args.includes('--all-vulns'));
    assert.ok(args.includes('--no-call-analysis'));
    writeFileSync(args[args.indexOf('--output-file') + 1], typeof report === 'string' ? report : JSON.stringify(report));
    return { status, stdout: 'scanner output', stderr: 'scanner diagnostics', ...extra };
  };
}

test('clean complete report passes and retains raw report and diagnostics', t => {
  const f = fixture(t), result = runScan({ ...f, launch: fakeScanner(f.report) });
  assert.equal(result.exitCode, 0);
  assert.equal(result.packages, 1);
  assert.equal(readFileSync(path.join(result.runDir, 'stderr.log'), 'utf8'), 'scanner diagnostics');
  assert.deepEqual(JSON.parse(readFileSync(path.join(result.runDir, 'osv.json'), 'utf8')), f.report);
});

test('vulnerable report fails, deduplicates advisory IDs and retains all packages', t => {
  const f = fixture(t);
  f.report.results[0].packages[0].vulnerabilities = [{ id: 'GHSA-example' }];
  f.report.results[0].packages.push({ package: { name: 'example', version: '2.0.0', ecosystem: 'npm' }, vulnerabilities: [{ id: 'GHSA-example' }] });
  writeFileSync(f.lockfile, readFileSync(f.lockfile, 'utf8') + '\nexample@^2.0.0:\n  version "2.0.0"\n');
  const result = runScan({ ...f, launch: fakeScanner(f.report, 1) });
  assert.equal(result.exitCode, 1);
  assert.equal(result.affectedPackages, 2);
  assert.deepEqual(result.advisoryIds, ['GHSA-example']);
});

for (const [name, change, status] of [
  ['empty results', f => { f.report.results = []; }, 0],
  ['zero packages', f => { f.report.results[0].packages = []; }, 0],
  ['partial lockfile coverage', f => { writeFileSync(f.lockfile, readFileSync(f.lockfile, 'utf8') + '\nsecond@^1:\n  version "1.0.0"\n'); }, 0],
  ['wrong source', f => { f.report.results[0].source.path = path.join(f.root, 'other.lock'); }, 0],
  ['malformed package', f => { delete f.report.results[0].packages[0].package.version; }, 0],
  ['hidden findings with success exit', f => { f.report.results[0].packages[0].vulnerabilities = [{ id: 'GHSA-example' }]; }, 0],
  ['failure exit with no findings', () => {}, 1],
  ['scanner failure', () => {}, 2],
  ['reported API error', f => { f.report.errors = ['API unavailable']; }, 0],
]) test(`${name} fails closed`, t => {
  const f = fixture(t); change(f);
  const result = runScan({ ...f, launch: fakeScanner(f.report, status) });
  assert.equal(result.exitCode, 2);
  assert.ok(result.error);
  assert.equal(JSON.parse(readFileSync(path.join(result.runDir, 'summary.json'), 'utf8')).status, 'error');
});

test('malformed JSON fails closed', t => {
  const f = fixture(t);
  assert.equal(runScan({ ...f, launch: fakeScanner('{broken') }).exitCode, 2);
});

test('timeout cannot reuse an earlier clean report', t => {
  const f = fixture(t);
  mkdirSync(f.outputDir, { recursive: true });
  writeFileSync(path.join(f.outputDir, 'osv.json'), JSON.stringify(f.report));
  const error = new Error('scanner timed out'); error.code = 'ETIMEDOUT';
  const result = runScan({ ...f, launch: () => ({ status: null, signal: 'SIGTERM', error }) });
  assert.equal(result.exitCode, 2);
  assert.match(result.error, /timed out/);
});

test('missing executable and missing lockfile each fail closed', t => {
  const f = fixture(t);
  assert.equal(runScan({ ...f, launch: () => ({ status: null, error: new Error('ENOENT') }) }).exitCode, 2);
  assert.equal(runScan({ ...f, lockfile: path.join(f.root, 'missing.lock'), launch: () => { throw new Error('must not execute'); } }).exitCode, 2);
});
