# Aghbari Commerce — Tooling Baseline

## Playwright
- Status: PRESENT
- Package: @playwright/test 1.63.0
- E2E command: \`npm run test:e2e\`
- Chromium installation: \`npx playwright install --with-deps chromium\` in deployment E2E workflow
- Evidence: HTML report, screenshots on failure, video/trace on retry
- Action: no duplicate installation and no version change without a proven compatibility need

## Gitleaks
- Status: ADDED on isolated branch \`ops/tooling-baseline-20260918\`
- Version: v8.30.1
- Distribution: official GHCR container, pinned by digest
- Mode: full Git history scan with redacted output
- CI workflow: \`.github/workflows/gitleaks-secrets.yml\`
- No Gitleaks license secret is required for this free CLI/container route
- Security rule: never print, store, or commit secret values
- Verification state: workflow source added; CI execution must be reconciled before treating it as PASS

## Separation rule
This tooling branch is independent of the product candidate. Do not transfer its result into candidate certification until the tooling changes are intentionally merged and their exact-SHA effects are reverified.

## Free-tier strategy
Prefer local/open-source CLI and GitHub-hosted execution for core proof and security. Hosted services are accelerators, not mandatory proof dependencies.

## CodeQL
- Status: IMPLEMENTED in .github/workflows/codeql.yml
- Scope: public repository JavaScript/TypeScript code scanning
- GitHub documents CodeQL CLI/code scanning as free for public repositories.
- CI result: pending actual workflow execution; no PASS claim yet.

## Semgrep Community Edition
- Status: IMPLEMENTED in .github/workflows/semgrep.yml
- Mode: local/CI Semgrep CE with semgrep scan --config auto
- No Semgrep login/token is required for Community Edition CLI usage.
- CI result: pending actual workflow execution; no PASS claim yet.

## Trivy
- Status: IMPLEMENTED in .github/workflows/trivy.yml
- Scanner: Trivy filesystem mode, HIGH/CRITICAL, SARIF evidence.
- Action: aquasecurity/trivy-action@v0.36.0
- Trivy version: v0.74.0
- Current official release information was checked before integration. The 2026 supply-chain incident makes version discipline mandatory; do not downgrade to compromised or unverified tags.
- CI result: pending actual workflow execution; no PASS claim yet.

## OWASP ZAP
- Status: IMPLEMENTED in .github/workflows/zap-baseline.yml
- Mode: manual-only baseline DAST against an explicitly supplied HTTPS target.
- It does not automatically scan arbitrary deployments and does not promote or change aliases.
- Action: zaproxy/action-baseline@v0.15.0
- CI result: pending an intentional manual run; no PASS claim yet.

## Dependabot
- Status: IMPLEMENTED in .github/dependabot.yml
- Ecosystems: npm and GitHub Actions
- Schedule: weekly
- Purpose: dependency freshness and security update PRs.

## Connected acceleration layer
- Firecrawl: CONNECTED
- TinyFish: CONNECTED
- PostHog: CONNECTED
- Codex Security: NOT CONNECTED
- Datadog: NOT CONNECTED

## Evidence rule
Tool installation/configuration is not a proof result. Every scanner must have an observed run, result, artifact and exact SHA before its evidence is marked PASS.
## OpenSSF Scorecard
- Status: IMPLEMENTED in .github/workflows/scorecard.yml
- Free for public repositories.
- Runs on main and weekly; workflow_dispatch is also available.
- Action and upload dependencies are pinned to exact commit SHAs.
- Publishes results and uploads SARIF for code-scanning/evidence.
- CI result: pending actual workflow execution; no PASS claim yet.