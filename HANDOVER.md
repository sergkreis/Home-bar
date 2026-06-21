# Domashniy Bar - Handover

Последнее обновление: 2026-06-21

## Быстрый Контекст

Domashniy Bar - phone-oriented Expo / React Native Web / TypeScript приложение для подбора коктейлей из ингредиентов, которые уже есть дома.

Живой сайт:

```text
https://kreisphoto.de/
```

Последний app-content commit с полным набором иллюстраций:

```text
59873e3 Complete cocktail art set
```

Последний проверенный remote commit перед этим docs-merge:

```text
1afe0d2 Update Mac handover and smoke test
```

Последний проверенный GitHub Actions deploy перед этим docs-merge:

```text
https://github.com/sergkreis/Home-bar/actions/runs/27514689629
```

Текущий production bundle на момент проверки:

```text
/_expo/static/js/web/index-3ceb18d6d67c6bd5bd53e68c295291bd.js
```

Глобальный индекс проектов:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
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
Domain/live URL: https://kreisphoto.de/
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
GitHub Actions deploy succeeded:
  https://github.com/sergkreis/Home-bar/actions/runs/27514689629
Production check on 2026-06-15:
  https://kreisphoto.de/ returned 200 OK.
  https://www.kreisphoto.de/ returned the same current bundle.
  Current deployed JS bundle contains AuthModal, supabase, old-cuban-art, and zombie-art.
  Service worker files /sw.js and /service-worker.js were 404 before the stale-cache cleanup pass.
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
$env:PLAYWRIGHT_BASE_URL='https://kreisphoto.de'; npm run test:ui
```

On macOS/Linux:

```bash
PLAYWRIGHT_BASE_URL=https://kreisphoto.de npm run test:ui
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
4. Configure Auth site URL and redirect URLs for https://kreisphoto.de/.
5. Configure custom SMTP/Resend in Supabase Dashboard for production auth emails.
6. Without env vars the app stays in local-only mode.
```

## Last Verification

Last full local verification on Windows on 2026-06-14:

```text
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
Browser plugin check against http://localhost:8081/
Production HTTP check against https://kreisphoto.de/
```

Result:

```text
Type-check passed.
Unit tests passed: 4 files, 30 tests.
Static web build passed and included 81 drink assets.
Playwright UI tests passed: 6 passed.
Browser check found no broken visible images and no console errors.
Production returned 200 OK.
```

Last macOS continuity verification on 2026-06-15:

```text
npm ci
npm test
npx tsc --noEmit
npm run build:web
npm run test:ui
PLAYWRIGHT_BASE_URL=https://kreisphoto.de npm run test:ui
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
Local development has no .env by default, so account tab stays in local-only mode unless .env is created from .env.example.
Custom SMTP/Resend setup was configured through dashboards by the user; verify templates and delivery when changing auth.
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
Recipe database still needs editorial review: ingredient names, units, serving text, and Russian wording.
Admin/editor surface for cocktail database exists in planning but should be improved before heavy database editing.
App.tsx still does too much: screen switching, filtering, shopping suggestions, and layout remain together.
Account sync should still be checked on actual phones after UX/auth changes.
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
```

## Следующие Шаги

```text
1. QA full account flow on real devices: sign-up, confirm email, sign-in, password reset, profile save, bar sync, favorites sync.
2. Improve admin/editor UI for cocktail database.
3. Continue editorial cleanup of recipes, ingredient names, and units.
4. Optimize drink PNG assets if performance requires it.
5. Split App.tsx tab/detail/onboarding screens into separate components.
6. Add deeper hook-level tests around account-local merge behavior and remote sync edge cases.
7. Update GitHub Actions Node version before Node 20 actions are removed.
```

## Запрещено

```text
Не деплоить to kreisphoto.de без явного разрешения.
Не удалять backup /root/home-bar-cleanup-backups/20260501-131803 без отдельного решения.
Не обновлять generated data без внимательной проверки diff.
Не коммитить SSH private keys, .env, API keys, passwords, local logs.
Не отключать password SSH на VPS без отдельного явного решения.
```

## Как Продолжать В Новом Чате

```text
Open C:\Users\Sergej\Documents\Codex\PROJECTS.md and continue Domashniy Bar.
Then open this HANDOVER.md.
Before deployment work, run type-check/build/tests and verify the live site state.
Deployment is handled by GitHub Actions after push to main.
```
