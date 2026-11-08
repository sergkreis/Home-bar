# Android candidate — implementation checkpoint

Base `4f5b058bc3ce903650d39b1e6ed19b3ad8f4e07a` matched remote HEAD; initial tree clean. Branch `tim/android-candidate-privacy-cleanup`, isolated checkout only. Commit: see `git rev-parse HEAD` after local commit; no push.

Implemented: accessible guest/pre-18+/account/auth-modal privacy link with browser failure text; scoped bar/favorites cleanup on successful logout and account RPC deletion, serialized writes to prevent late resurrection, guest keys preserved; native `inmybar://auth/callback` PKCE code exchange and Supabase recovery event; Russian Android build/manual QA document. No backend, production, key, remote or Play changes.

Checks: `tsc --noEmit` pass; `npm test` 11 files / 64 passed; `npm run test:ui` 17 passed / 4 pre-existing skipped including new privacy UI on desktop/mobile/320px; `npm run build:web` pass; Android `expo export` pass (81 assets, Hermes bytecode only, NOT APK/AAB); `git diff --check` pass. `npm audit --omit=dev --audit-level=high` exit 1: 28 transitive advisories (8 moderate/19 high/1 critical), no automatic upgrades. Shell-quote critical is via react-devtools-core, not shown reachable from shipping app; native artifact inspection still needed.

Native candidate pending: current host lacks Java, SDK, adb, EAS CLI, signing/inspection tools; EAS project ID in config but credentials/versionCode metadata unqueried; Supabase redirect allowlist and email delivery not checked. No APK/AAB built, installed, signed or deployed. Parent decides next native build path. Exact commands and acceptance in ANDROID-CANDIDATE.md.
