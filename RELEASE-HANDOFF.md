# In My Bar — release handoff (2026-11-08)

This release-branch handoff supersedes old store/build status in ANDROID-CANDIDATE.md, IMPLEMENTATION-CHECKPOINT.md and HANDOVER.md. It does not authorize merge or deployment.

## Source and artifact

- Repository: https://github.com/sergkreis/Home-bar
- Branch: `release/google-play-preflight`; PR target: `main`.
- Android v5 source: `a04478eb24a6124919879358702e80d549da0243` (vintage duet branding, account isolation/recovery, cloud hydration, restricted permissions and disabled Android backups).
- Package `app.inmybar`; versionName `1.0.0`; versionCode `5`.
- Expo owner `sergkreiss-team`; project ID `176f9f21-0e28-4848-9751-e786666f6fe5`.
- EAS build: https://expo.dev/accounts/sergkreiss-team/projects/domashniy-bar/builds/1c69817f-9abd-4481-be0b-ff76c19bcd0e
- AAB SHA-256: `d90e2ac70c51f2c91368a511cf64a72014a38e3af72bb303a3cd2d048d60a34f`.
- Local evidence (not committed): `D:/HermesDev/HomeBar-preservation/20261104-220638/duet-release-qa/V5-FINAL-VERIFICATION.json`; AAB in its parent directory as `homebar-a04478e-v5.aab`.
- Later privacy/documentation commits are not a new Android build. The startup-diagnostics branch is excluded.

## Store and tester access

Reported by the coordinating release session on November 8; not a fresh Play Console inspection during this GitHub synchronization:

- v5 is published to **closed Alpha testing**, track `4701469142830865110`, Russia and Germany selected. **Public production is not released.**
- Google Group `inmybar-testers@googlegroups.com` is enabled; its access change was approved November 8.
- Group: https://groups.google.com/g/inmybar-testers
- Play opt-in: https://play.google.com/apps/testing/app.inmybar
- A Play-installed v5 update, all five tabs and preservation of six guest ingredients were verified on the owner phone.
- **Open issue:** a friend on a fresh phone reports a Google Play technical error. Cause and resolution remain unknown. Approval does not prove fresh-device availability; do not call this issue-free or the closed-testing requirement complete.

## Evidence and limitations

The pinned artifact report records typecheck passed, 120 unit tests passed, bundletool validation and upload-signature verification passed, 32/32 ELF64 libraries passed static alignment checks, and `PAGE_ALIGNMENT_16K`. Manifest: minSdk 24, targetSdk 36, `allowBackup=false`, permissions only `android.permission.INTERNET` and `app.inmybar.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. Earlier pinned UI checks: 17 passed / 4 skipped; web export passed. Static alignment is not a 16 KB-device runtime test.

`web/privacy.html` synchronizes the separately approved, already-published policy at https://inmybar.app/privacy.html (including `#delete-account`). Local and live bytes were rechecked during synchronization: SHA-256 `ec09ac767db6e7f1b26239c4d4e566d98820b05956bf37bb33b62c16f54459cf`.

Privacy evidence remains local: `D:/HermesDev/HomeBar-preservation/privacy-evidence-20261107-001415/REPORT-RU.md`. The corrected policy is not proof of full legal compliance. Provider/log/backup retention, current SMTP details, complete deletion handling (including the admin foreign-key case), and legal bases/transfer safeguards retain the limitations recorded there. Full account, cross-device and accessibility acceptance is not established by unit/guest checks. Historical dependency advisories are not fixed by this synchronization; do not run forced upgrades.

## GitHub-only continuation

Continue all project changes on a branch through a GitHub PR. Do not merge this PR or enable auto-merge without separate approval: `.github/workflows/deploy.yml` deploys on pushes to `main` or explicit `workflow_dispatch`. The inspected workflow has no pull-request or release-branch push trigger; no repository webhooks were listed. Preserve existing checkouts, bundles and evidence; do not commit credentials, environment files, backups, logs, generated exports or release binaries.

Recheck with `npx tsc --noEmit`, `npm test`, `npm run build:web`, `npm run test:ui` and `git diff --check`. Run UI checks locally, not against production. Record fresh results and unresolved failures in the PR; historical results above are not a fresh run. No Play submission, new native build, tag, release upload, backend change or website deployment is authorized here.

## Fresh synchronization checks (2026-11-08)

On Windows, Node v22.22.2: TypeScript passed; Vitest 17 files / 120 tests passed; web export passed; local Playwright 17 passed / 4 conditional skips (21 total, two workers). `git diff --check` passed. Secret-pattern scan covered all five unpushed commits and their new blob versions, plus the privacy/handoff changes: no secret findings. One execution-pattern match was an unchanged regular-expression `.exec`, not code execution. Focused one-shot self-review was performed; no new independent reviewer was spawned. Vitest warned about future Vite native-config-loader compatibility; it did not fail. These results do not resolve the fresh-phone Play error.
