# Tooling proof-system repair — 2026-09-18

## Observed failures

PR #72 run `35321971572` (Semgrep CE) failed before scan execution because the workflow's YAML scalar `run: [[ "$TARGET_SHA" =~ ... ]]` was rendered by GitHub as `test "$TARGET_SHA" =~ ...`, producing `test: =~: binary operator expected`.

PR #72 run `35321971420` (CodeQL) failed for the same YAML parsing defect: the intended Bash `[[ ... =~ ... ]]` expression was rendered as `test "$TARGET_SHA" =~ ...` and exited with code 2.

PR #72 run `35321971459` (Gitleaks) failed at exact checkout verification on the triggering head `56ed42bce07b5ec57ad7407bc1c79bd25643efdf`; the run was created before the later tooling commit `f505dd6e6ae72fd0db07aa68931b6a63e5be6295`. This is retained as a separate reconciliation issue and is not treated as a secret-scan result.

## Repairs applied

- `.github/workflows/semgrep.yml`: replaced YAML-sensitive `[[ ... =~ ... ]]` scalar with `printf | grep -Eq` validation.
- `.github/workflows/codeql.yml`: replaced the same YAML-sensitive validation with `printf | grep -Eq`.

Resulting tooling head after these two repairs: `0150bf3de652304bb94258e59fca1f2b0ac9651a` (latest sequential commit; the preceding Semgrep repair is `f505dd6e6ae72fd0db07aa68931b6a63e5be6295`).

## Safety

- PR #72 remains isolated and draft.
- Candidate `5b9f2a76615e76bb6444c81f39e02f3479c0704b` was not modified.
- Production was not modified.
- No security assertion was weakened and no finding was suppressed.
- Fresh CI on the new tooling head must terminalize before any tooling PASS is admitted.
