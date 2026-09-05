# Domashniy Bar - Handover

Последнее обновление: 2026-07-10

## Быстрый Контекст

Domashniy Bar - phone-oriented Expo / React Native Web / TypeScript приложение для подбора коктейлей из ингредиентов, которые уже есть дома.

## Ревью И Исправления 2026-07-10

```text
Проведены code, design и UX review; исправления задеплоены через GitHub Actions 2026-07-10.
useSavedBar/useFavorites теперь сериализуют remote save и сохраняют последнее ожидающее локальное состояние.
Web-навигация поддерживает URL вкладок, /cocktails/:id, direct links, browser Back и popstate.
Шапка и нижняя навигация адаптированы для 320 px; добавлен Playwright-проект small-phone.
Auth modal получил видимые labels, show/hide password и accessibility/live-region атрибуты.
Lucide остаётся на индивидуальных imports; Metro настроен без package exports warning и игнорирует Playwright artifacts.
Обновлены совместимые прямые зависимости: Supabase 2.110.2, Lucide 1.24.0, Playwright 1.61.1.
Deploy workflow подготовлен к Node 24, actions checkout/setup-node v6, npm ci и unit tests.
Проверки: TypeScript passed; Vitest 7 files / 40 tests passed; Expo Doctor 18/18;
web export passed (~1.1 MB JS); Playwright 13 passed / 2 conditional skips; Android Expo export passed.
npm audit production tree всё ещё сообщает 17 проблем Expo 54 toolchain; npm audit fix не предлагает
совместимого исправления, а --force потребовал бы major Expo upgrade.
Untracked REVIEW-2026-06-15.md не изменялся и не должен включаться автоматически.
Deploy runs 29115416260 и 29115813284 завершились успешно; финальный documentation push создаёт следующий run.
```

Живой сайт:

```text
https://inmybar.app/
```

Последний app-content commit с полным набором иллюстраций:

```text
59873e3 Complete cocktail art set
```

Последний проверенный production commit перед session-close auth push:

```text
37da852 Handle Android back on cocktail detail
```

Последний проверенный GitHub Actions deploy перед session-close auth push:

```text
https://github.com/sergkreis/Home-bar/actions/runs/28319755529
```

Текущий production bundle на момент проверки перед session-close auth push:

```text
/_expo/static/js/web/index-ea9bbfa8dda1dc5eb0b5caff36604414.js
```

Глобальный индекс проектов:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
/Users/sergejkreis/Projects/codex-workspace-index/PROJECTS.md
```

Текущая локальная сессия на Windows:

```text
2026-06-28: Android debug/client QA продолжен на реальном Nothing Phone A001T / Android 16.
Package id: app.inmybar.
Supabase env добавлены локально в .env без вывода секретов; .env игнорируется git.
Проверены регистрация, email confirmation и авторизованное состояние после reload.
Исправлены auth loading timeout/finally, native redirect URL guard, web-only detectSessionInUrl и KeyboardAvoidingView/ScrollView в auth modal.
Gmail положил confirmation email в spam; это deliverability/SMTP/DNS задача, не клиентский баг.
Commit/push for this auth QA pass were approved at session close; continue from latest origin/main and verify final git status before editing.
```

## Пути И Репозиторий

Windows checkout:

```text
C:\Users\Sergej\Projects\apps\domashniy-bar
```

macOS checkout:

```text
/Users/sergejkreis/Projects/apps/domashniy-bar
```

GitHub:

```text
https://github.com/sergkreis/Home-bar.git
```

Основная ветка:

```text
main
```

## Технологии

```text
Expo SDK 54
React 19
React Native 0.81
React Native Web
React Native Safe Area Context
TypeScript strict mode
npm / package-lock.json
Static web export served by nginx
Playwright UI tests
GitHub Actions deploy
Supabase Auth/Postgres account sync
Resend/custom SMTP configured through Supabase Dashboard for auth emails
```

## Основные Файлы

```text
App.tsx                              main app shell, screen switching, layout and tab rendering
assets/drinks/                       81 generated PNG cocktail illustrations
src/components/DrinkArt.tsx          cocktail id -> illustration mapping
src/components/BottomNav.tsx         bottom tab navigation
src/components/                      reusable UI components
src/hooks/useAuth.ts                 Supabase auth session state and email/password actions
src/hooks/useSavedBar.ts             AsyncStorage persistence plus optional Supabase sync for selected home bar
src/hooks/useFavorites.ts            AsyncStorage persistence plus optional Supabase sync for favorite cocktails
src/hooks/useUserProfile.ts          optional Supabase profile load/save state
src/lib/supabase.ts                  Supabase client using Expo public env vars
src/services/userBarService.ts       user_bars load/upsert helpers
src/services/userFavoritesService.ts user_favorites load/upsert helpers
src/services/userProfileService.ts   user_profiles load/upsert helpers
supabase/schema.sql                  user_bars/user_favorites/user_profiles tables and RLS policies
src/data/                            generated cocktail/ingredient data
src/utils/                           matching and shopping suggestion logic
src/utils/persistedIds.ts            scoped local storage keys and persisted/remote id sanitizing
tests/home-bar.spec.ts               Playwright smoke tests for core flow
scripts/import-cocktails.mjs         import/generation from TheCocktailDB plus curated data
scripts/postprocess-web-export.mjs   PWA metadata patch after Expo export
deploy/                              VPS/nginx deployment scripts and config
.github/workflows/deploy.yml         GitHub Actions deploy workflow
```

## Предыдущее Состояние На 2026-06-28

```text
Before the session-close commit, main was aligned with origin/main at 37da852.
Tracked changes were limited to auth fixes and docs updates.
Untracked REVIEW-2026-06-15.md remained intentionally uncommitted.
Production https://inmybar.app/ returns 200 OK.
Production HTML is no-store and referenced index-ea9bbfa8dda1dc5eb0b5caff36604414.js before the auth push.
/sw.js and /service-worker.js return cleanup service workers with no-store and Service-Worker-Allowed: /.
Local 2026-06-28 checks passed: npx tsc --noEmit, npm test, npm run build:web, npm run test:ui.
Android dev-client reload with Supabase env showed the authenticated account state and clean app-filtered logcat.
Known build warning remains: lucide-react-native private deep icon import warnings during web export.
```

## Реализованные Возможности

```text
First-run ingredient selection for guests
Saved selected home bar on device with AsyncStorage
Account modal for sign-in/sign-up/reset/update-password
Optional transient session checkbox in auth modal
Supabase-backed bar sync through user_bars
Supabase-backed favorite cocktail sync through user_favorites
Supabase-backed account profile settings through user_profiles
Account-local AsyncStorage keys are separated by user id
Guest bar/favorites are not merged into an account after sign-in; account remote state is authoritative
Home screen with summary counters
Dedicated bar screen
Dedicated recipe detail screen
Ingredient picker grouped by category
Collapsible ingredient categories
Featured common ingredient block
Ingredient search inside picker
Quick modes for evening scenarios
Taste filters: refreshing, sweet, sour, strong, bitter
Ranked cocktail list by ingredient match
Recipe detail with glass, ingredients, steps, garnish
Shopping suggestions for 1-2 missing ingredients
Bottom navigation with lucide/react-native-svg icons
Android safe-area handling through react-native-safe-area-context
Native Android package id app.inmybar
Production dark emerald/gold visual direction
Generated cocktail database from TheCocktailDB plus curated classics
Generated cocktail illustrations for every cocktail in the current database
PWA metadata post-processing after web export
```

## Данные

Snapshot на 2026-06-15:

```text
Cocktails: 81
Ingredients: 99
Recipe ingredient links: 310
Starter ingredients: 18
Drink illustration assets: 81 / 81
```

Ingredient categories:

```text
spirit: 21
liqueur: 26
wine: 5
mixer: 16
citrus: 2
sweetener: 5
garnish: 11
pantry: 13
```

Illustration state:

```text
All current cocktails have PNG assets in assets/drinks/.
DrinkArt.tsx maps every current cocktail id to a generated asset.
Latest completed asset batch commit: 59873e3 Complete cocktail art set.
Images were generated as chroma-key sources, converted to transparent PNG locally, and committed as project assets.
```

## Деплой

VPS:

```text
212.227.28.224
```

Production:

```text
Domain/live URL: https://inmybar.app/
Static web export served by nginx
Web root: /var/www/home-bar
Existing Let's Encrypt certificate on server; re-check expiry before certificate-sensitive work
```

Current deployment workflow:

```text
Local edit -> type-check/build/test -> commit -> push to GitHub main.
GitHub Actions builds Expo web export and deploys dist/ to VPS over SSH.
Workflow file: .github/workflows/deploy.yml
Required GitHub secret: VPS_SSH_KEY
Required public build secrets for cloud sync: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
Server deploy key comment: github-actions-home-bar
Password SSH was left enabled on the VPS.
```

Recent deployment state:

```text
VPS was cleaned on 2026-05-01.
Old KIKU files and services were backed up to /root/home-bar-cleanup-backups/20260501-131803 before removal.
Full cocktail art set was deployed on 2026-06-14 through GitHub Actions.
macOS continuity/smoke-test commit was deployed on 2026-06-15 through GitHub Actions.
Production account sync/assets prep and persisted id helper commits were deployed on 2026-06-21.
Stale service worker cleanup was deployed on 2026-06-21.
GitHub Actions deploy succeeded:
  https://github.com/sergkreis/Home-bar/actions/runs/27912173646
Production check on 2026-06-21:
  https://inmybar.app/ returned 200 OK.
  Current deployed JS bundle is /_expo/static/js/web/index-0c5e33e03d027db7c1a7c0669165bf84.js.
  /manifest.json, /sw.js, and /service-worker.js are served with no-store cache headers.
  Cleanup service workers unregister themselves and clear stale Cache Storage.
```

## Проверка И Команды

Install:

```bash
npm install
```

Run Expo:

```bash
npm start
```

Run Android dev build:

```bash
npm run android
```

Real Android device notes:

```text
Windows tested device: Nothing Phone A001T / Android 16 / arm64-v8a.
Enable Developer Options -> USB debugging, select USB file transfer, authorize RSA prompt.
For debug builds, keep Metro on 127.0.0.1:8081 and run adb reverse tcp:8081 tcp:8081.
The generated android/ folder is native Expo prebuild output and is ignored by git.
```

Run web:

```bash
npm run web
```

Build static web:

```bash
npm run build:web
```

Type-check:

```bash
npx tsc --noEmit
```

Unit tests:

```bash
npm test
```

Playwright UI tests:

```bash
npm run test:ui
npm run test:ui:headed
```

Run UI tests against production:

```bash
$env:PLAYWRIGHT_BASE_URL='https://inmybar.app'; npm run test:ui
```

On macOS/Linux:

```bash
PLAYWRIGHT_BASE_URL=https://inmybar.app npm run test:ui
```

Regenerate cocktail data:

```bash
npm run import:cocktails
```

Supabase setup:

```text
1. Create/open Supabase project.
2. Run supabase/schema.sql in Supabase SQL Editor.
3. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY locally and as GitHub Actions secrets.
4. Configure Auth site URL and redirect URLs for https://inmybar.app/.
5. Configure custom SMTP/Resend in Supabase Dashboard for production auth emails.
6. Without env vars the app stays in local-only mode.
```

## Last Verification

Last Windows Android/account verification on 2026-06-28:

```text
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
npx expo start --dev-client --localhost
adb reverse tcp:8081 tcp:8081
Real phone auth QA on Nothing Phone A001T / Android 16
Android app-filtered logcat check
```

Result:

```text
Type-check passed.
Unit tests passed: 35 tests.
Static web build passed and produced 81 drink assets.
Playwright UI tests passed: 6 passed.
Supabase .env was loaded locally without exposing values.
Sign-up no longer hangs on "Проверяем".
Email confirmation reached the mailbox and account became authenticated in the Android dev client.
Password fields in the auth modal remain usable above the phone keyboard.
Android logcat check found no ReactNativeJS/AndroidRuntime app errors after reload.
Gmail classified the confirmation email as spam; fix via Supabase SMTP/domain deliverability.
```

Previous Windows Android/phone verification on 2026-06-21:

```text
npx tsc --noEmit
npm test
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=arm64-v8a --console=plain --no-daemon
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
npm run build:web
Real phone visual QA on A001T / Android 16
```

Result:

```text
Type-check passed.
Unit tests passed: 4 files, 30 tests.
Android debug APK build passed and was installed on the real phone.
Safe-area no longer overlaps the Nothing OS status bar or gesture bar.
Cocktail detail title no longer breaks into narrow syllable columns on the phone.
Static web build passed.
Runtime logcat check found no app FATAL EXCEPTION.
Known warnings remain: lucide-react-native private deep icon import warnings, Gradle deprecation warnings, npm audit reports 27 vulnerabilities after npm install.
```

Last full verification on macOS on 2026-06-21:

```text
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
PLAYWRIGHT_BASE_URL=https://inmybar.app npm run test:ui
Production HTTP/header checks against https://inmybar.app/
Browser checks in Chrome and Safari on the local Mac
```

Result:

```text
Type-check passed.
Unit tests passed: 35 tests.
Static web build passed and included 81 drink assets.
Playwright UI tests passed: 6 passed.
Production returned 200 OK.
Production service worker cleanup endpoints returned 200 with no-store headers.
Chrome loaded the fresh site after local state/cache cleanup.
Safari loaded the fresh site; any "old" view was first-run onboarding state.
```

## Handoff For Next Chat

```text
Start by checking git status --short --branch.
Read this HANDOVER.md before making changes.
Do not touch secrets, .env, auth.json, browser profile files, or VPS private data.
Do not automatically commit untracked REVIEW-2026-06-15.md.
After continuing on another computer, pull main and run npx tsc --noEmit, npm test, npm run build:web.
If production needs verification, check the latest GitHub Actions run created by the 2026-06-28 session-close push.
If Safari/Chrome look stale again, first verify the production bundle and local first-run state before changing code.
Expected production first-run path: age gate -> "Собери бар" -> "Стартовый" -> "Подобрать коктейли" -> "Сегодня".
Deploy only after explicit approval because production is inmybar.app.
```

Last macOS continuity verification on 2026-06-15:

```text
npm ci
npm test
npx tsc --noEmit
npm run build:web
npm run test:ui
PLAYWRIGHT_BASE_URL=https://inmybar.app npm run test:ui
npx expo-doctor
```

Result:

```text
Vitest passed: 30 passed.
Type-check passed.
Static web build passed.
Local Playwright smoke test passed: 6 passed.
Production Playwright smoke test passed: 6 passed.
Expo Doctor passed: 18/18 checks.
npm audit still reports 17 vulnerabilities; fixes require major upgrades for vitest and Expo.
Metro still warns about private lucide-react-native deep icon imports, but build succeeds.
```

Known build warnings:

```text
Metro warns that individual lucide-react-native CJS icon files are not exported by package exports.
This is intentional for now because root lucide imports previously inflated the web bundle.
GitHub Actions warns that Node.js 20 actions are deprecated; update workflow to Node 24 after compatibility is confirmed.
```

Last local verification on macOS on 2026-06-21:

```text
npm test
npx tsc --noEmit
npm run build:web
npm run test:ui
```

Result:

```text
Vitest passed: 35 passed.
Type-check passed.
Static web build passed and postprocessed PWA metadata into dist/.
Local Playwright smoke test passed: 6 passed.
Metro still warns about private lucide-react-native deep icon imports, as previously noted.
```

## Supabase/Auth State

```text
Supabase project was created by the user.
supabase/schema.sql was run in SQL Editor during previous work.
GitHub Actions secrets for Supabase URL and anon key were added.
Production is built with Supabase env and shows the account sign-in flow.
Local development stays in local-only mode unless .env is created from .env.example.
On 2026-06-28 the Windows checkout had a local .env with Expo public Supabase values; values were verified by shape only and not printed.
Real phone Android dev-client QA on 2026-06-28 verified sign-up, email confirmation, and authenticated state after reload.
Custom SMTP/Resend setup was configured through dashboards by the user; Gmail still sent the confirmation email to spam, so verify sender domain, SPF, DKIM, DMARC, and template content.
User profile fields exist in app and schema: display_name, birth_date.
```

Important auth behavior:

```text
Guest state is separate from account state.
When a user signs in, the account's remote bar/favorites are authoritative.
Guest-selected ingredients are not merged into an existing account after sign-in.
Authenticated AsyncStorage keys are scoped by Supabase user id.
Persisted and remote ids are sanitized through src/utils/persistedIds.ts.
```

## Git/GitHub Notes

```text
GitHub remote: https://github.com/sergkreis/Home-bar.git
Current deploy path is GitHub Actions, not manual server copy.
gh CLI is available and authenticated on the checked machines used recently.
Repository is public; current user has ADMIN permission.
No open GitHub PRs or issues were found on 2026-06-15.
GitHub Actions workflow "Deploy Home Bar" is active and the latest checked runs were successful.
```

## Frontend/Design Notes

Current visual direction:

```text
Dark emerald/gold home-bar style inspired by a premium cocktail menu.
Cocktail art uses vintage engraved illustrations with transparent PNG cutouts.
Cards and bottom navigation are optimized for phone-first usage.
2026-06-21 real-phone design pass fixed Android safe-area overlap and mobile detail hero wrapping.
2026-06-28 auth modal pass fixed keyboard overlap for password fields on Android.
```

Frontend skill bundle to use for future web app work:

```text
C:\Users\Sergej\.codex\plugins\cache\openai-curated\build-web-apps\c6ea566d\skills\
```

Relevant skills:

```text
frontend-app-builder        - redesign/restyle/modernization and visual concept fidelity work
frontend-testing-debugging  - rendered UI testing, responsive checks, console/layout/debugging loops
react-best-practices        - React performance/refactor guidance for component changes
supabase-postgres-best-practices - schema/query review when changing Supabase
```

QA preference:

```text
Prefer the Browser plugin / in-app browser for rendered frontend QA when available.
Use Playwright for existing tests/home-bar.spec.ts and regression checks.
```

## Текущая Незавершенная Работа

```text
Session-close changes from 2026-06-28 should be committed and pushed before starting new work: AuthModal keyboard handling, useAuth timeout/error handling, native redirect guard, web-only Supabase URL session detection, README/HANDOVER/TODO/PROJECTS updates.
Account flow still needs continued QA for reset password, profile save, bar sync, favorites sync, and cross-device behavior.
Supabase auth email deliverability needs SMTP/domain work because Gmail marked the confirmation email as spam.
Recipe database still needs editorial review: ingredient names, units, serving text, and Russian wording.
Admin/editor surface for cocktail database exists in planning but should be improved before heavy database editing.
App.tsx still does too much: screen switching, filtering, shopping suggestions, and layout remain together.
Add unit tests around account-local isolation, no guest merge after sign-in, and remote sync edge cases.
Add more tests around matching/shopping logic before another database expansion.
Optimize PNG asset size if mobile loading becomes heavy.
Deployment still uses root over SSH in GitHub Actions; consider a restricted deploy user later.
Password SSH remains enabled on the VPS; do not change this without a separate decision.
```

## Review Notes History

```text
CocktailResults was updated to reset expanded card when result list changes.
scripts/import-cocktails.mjs was fixed so gin no longer matches inside ginger.
Carbonated water is normalized to soda-water.
PWA/mobile pass added manifest, lang=ru, viewport-fit=cover, apple metadata, and install icons.
Supabase account sync added auth, user_bars, user_favorites, user_profiles, and RLS schema.
Production UI/auth pass added modal auth, password reset/update, account profile fields, and account-local storage isolation.
Bottom nav and FavoriteButton use lucide/react-native-svg icons.
Playwright account smoke test accepts both local-only and Supabase-configured account modes.
macOS/GitHub continuity check found no case-only filename conflicts and no open PRs/issues on 2026-06-15.
Full cocktail art pass completed in batches and ended with 81/81 generated assets on 2026-06-14.
Persisted id helper pass on 2026-06-21:
  Added src/utils/persistedIds.ts and unit tests.
  useSavedBar and useFavorites now share account-scoped storage key and id sanitizing logic.
  Remote account state remains authoritative; stale/unknown remote ids are dropped instead of creating a phantom saved bar state.
Stale service worker cleanup pass on 2026-06-21:
  scripts/postprocess-web-export.mjs writes /sw.js and /service-worker.js kill-switch files.
  deploy/nginx-home-bar.conf serves those files and /manifest.json with no-store cache headers.
  Purpose: force old PWA/browser service workers to unregister and clear stale app-shell caches.
Android auth QA pass on 2026-06-28:
  AuthModal now uses KeyboardAvoidingView + ScrollView so password fields are not covered by the phone keyboard.
  useAuth wraps Supabase auth requests with timeout and try/catch/finally so loading cannot stay forever on "Проверяем".
  Native sign-up no longer crashes on window.location.origin; redirect URL is web-only when unavailable on React Native.
  Supabase client now uses detectSessionInUrl only on web.
  Real Android dev-client confirmed sign-up/email confirmation/authenticated state; Gmail spam remains external deliverability work.
```

## Следующие Шаги

```text
1. After an approved commit/deploy, pull main on the next machine and run npm ci, npx tsc --noEmit, npm test, npm run build:web.
2. Continue account QA: reset password, profile save, bar sync, favorites sync, and cross-device behavior between Windows/Mac/phone.
3. Specifically verify rapid edits and competing updates on two devices after the remote-save queue change.
4. Fix Supabase Auth email deliverability: custom sender/domain, SPF, DKIM, DMARC, and Gmail spam result.
5. Improve admin/editor UI for cocktail database.
6. Continue editorial cleanup of recipes, ingredient names, and units.
7. Optimize drink PNG assets if performance requires it.
8. Split App.tsx tab/detail/onboarding screens into separate components.
9. Add deeper hook-level tests around account-local merge behavior and remote sync edge cases.
10. Plan an Expo SDK upgrade before attempting forced npm audit remediation.
```

## Запрещено

```text
Не деплоить to inmybar.app без явного разрешения.
Не удалять backup /root/home-bar-cleanup-backups/20260501-131803 без отдельного решения.
Не обновлять generated data без внимательной проверки diff.
Не коммитить SSH private keys, .env, API keys, passwords, local logs.
Не отключать password SSH на VPS без отдельного явного решения.
```

## Как Продолжать В Новом Чате

```text
Open C:\Users\Sergej\Documents\Codex\PROJECTS.md and continue Domashniy Bar.
On macOS, open /Users/sergejkreis/Projects/codex-workspace-index/PROJECTS.md.
Then open this HANDOVER.md.
Pull latest main and inspect git status before editing.
Before deployment work, run type-check/build/tests and verify the live site state.
Deployment is handled by GitHub Actions after push to main.
```
