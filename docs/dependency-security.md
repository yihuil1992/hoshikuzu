# Dependency security checks

Use the repository's pinned Yarn 1.22.22 and a supported Node runtime. The patched
Sharp 0.35.5 requires Node >=20.9.0; CI uses Node 22. Confirm the Vercel build and
function runtime before merge. This change does not set `engines` or alter
Vercel configuration, so it does not silently change the production runtime.

```sh
yarn install --frozen-lockfile --ignore-scripts --non-interactive
yarn test:security
yarn lint
yarn typecheck
yarn build
OSV_SCANNER=/path/to/verified/osv-scanner yarn security:scan
```

In PowerShell, set `$env:OSV_SCANNER` to the verified executable before running
`yarn security:scan`. The scanner wrapper uses Node built-ins and does not need
dependency installation. It runs on Windows and Linux and scans the complete
`yarn.lock`, including optional packages for other platforms.

## Gate and reports

The workflow pins OSV Scanner 2.7.0 and verifies its official Linux release
SHA-256 before execution. GitHub Actions are pinned to commit SHAs. Pull requests,
main pushes, a weekly schedule and manual dispatch run the gate with only
`contents: read`; checkout does not persist credentials. The workflow does not
deploy to Vercel, use production credentials, or alter repository settings.

Each invocation creates a fresh `tmp/security/osv/run-*` directory containing:

- The complete `osv.json` with every scanned package and all findings.
- Scanner stdout/stderr, exact arguments, timestamps and `summary.json`.
- An error log on scanner execution or report validation failure.
- An explicitly empty scanner configuration, so local ignore rules cannot mask findings.

Exit 0 means a valid, complete report with zero findings. Exit 1 means known
vulnerabilities were found. Exit 2 means a scanner, input, coverage, parsing or
consistency error. Timeouts, missing tools, malformed/empty/partial reports and
exit-code/report disagreement fail closed. Coverage must match the number of
version stanzas in this generated Yarn v1 lockfile. A future lock format change
must update this validation; it must not bypass it.

CI uploads full reports with `if: always()` and 30-day retention. No advisory IDs,
platforms, package scopes or severities are suppressed. Native binary internals
and live deployment contents are outside a source-lock scan's coverage.

## Compatibility decisions

Next, eslint-config-next and @next/third-parties remain on 15.5.28. React stays on
the existing 19.2.1 and Three/Drei/Recharts/Framer Motion versions are unchanged.
The refresh removes only affected lock entries before Yarn regeneration, rather
than discarding the complete lockfile. A fresh full scan remains mandatory when
any further transitive resolution changes.

`next/postcss: 8.5.23` is a deliberate, narrow Yarn resolution. Next 15.5.28 still
requests exactly 8.4.31, which has the PostCSS source-map disclosure/DoS findings.
Updating the top-level PostCSS dependency cannot fix that nested exact pin.
Yarn's incompatible-resolution warning is expected and must not be hidden.

The override is within PostCSS 8's API line but outside Next's declared exact
constraint. Local validation compared a frozen-baseline build with the patched
build: both passed lint, strict TypeScript and production build. The two existing
CSS outputs were byte-identical after excluding one extra unused
`.contents{display:contents}` utility detected from the new workflow/scripts.
No existing CSS rules changed. Browser smoke tests covered the starfield,
audio, themes, navigation, countdowns and planner; local Next image optimization
and native Sharp PNG/resize/WebP conversion were also exercised.

Prefer removing this resolution once a compatible upstream Next patch stops
pinning vulnerable PostCSS. Re-run build/CSS and visual checks before removing
or changing it. Do not use a resolution simply to hide an advisory.

## Baseline and merge prerequisites

The 2026-10-23 baseline at commit `6190eee1eccdda101a811282c93e8039e144395a`
contained 619 locked packages, 23 affected package/version rows and 72 unique
advisory IDs. The real gate rejected that original lock with exit 1. The
remediated lock contained 627 packages and passed with zero findings. These are
dated source-lock results, not a permanent assurance or an exploitability claim.

The latest GitHub-recorded successful Production deployment used that baseline
commit. Vercel's dashboard required login, so the current production Node
version, alias and branch setting were not independently confirmed. Publishing
the branch and draft PR may trigger an automatic Vercel preview; it does not
authorize a production deployment or a runtime/settings change.

Before merge, verify production Vercel Node >=20.9.0 (CI uses Node 22), require
the Linux workflow and any automatic preview to pass for the current PR head,
review the scoped PostCSS exception and rescan if the lock changes. The local
checks used Windows Node 24.21.0; Linux CI is a separate verification stage.
