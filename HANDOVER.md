# Domashniy Bar - Handover

Последнее обновление: 2026-06-07

## Быстрый Контекст

Domashniy Bar - phone-oriented Expo / React Native Web / TypeScript приложение для подбора коктейлей из ингредиентов, которые уже есть дома.

Глобальный индекс проектов:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```

## Пути И Репозиторий

Локальный путь:

```text
C:\Users\Sergej\Projects\apps\domashniy-bar
```

GitHub:

```text
https://github.com/sergkreis/Home-bar.git
```

Ветка:

```text
main
```

Живой сайт:

```text
https://kreisphoto.de/
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
Optional Supabase Auth/Postgres account sync for bar and favorites
```

## Основные Файлы

```text
App.tsx                         - главный экран, screen switching, layout and tab rendering
src/components/                 - reusable UI components
src/hooks/useAuth.ts            - Supabase auth session state, email/password actions, password reset/update
src/hooks/useSavedBar.ts        - AsyncStorage persistence plus optional Supabase sync for selected home bar
src/hooks/useFavorites.ts       - AsyncStorage persistence plus optional Supabase sync for favorite cocktails
src/lib/supabase.ts             - Supabase client using Expo public env vars
src/services/userBarService.ts  - user_bars load/upsert helpers
src/services/userFavoritesService.ts - user_favorites load/upsert helpers
supabase/schema.sql             - user_bars/user_favorites tables and RLS policies
src/data/                       - generated cocktail/ingredient data
src/utils/                      - matching and shopping suggestion logic
tests/home-bar.spec.ts          - Playwright smoke test for core flow
scripts/import-cocktails.mjs    - импорт/генерация данных из TheCocktailDB
deploy/                         - VPS/nginx deployment scripts and config
.github/workflows/deploy.yml    - GitHub Actions deploy workflow
```

## Реализованные Возможности

```text
First-run ingredient selection screen for unregistered users
Muted "Account later" placeholder instead of a disabled registration CTA
Home screen with summary counters
Ingredient picker grouped by category
Collapsible ingredient categories
Featured "Часто бывает дома" ingredient block
Ingredient search inside picker
"What to drink tonight" quick modes
Accent styling for quick modes
Taste filters: refreshing, sweet, sour, strong, bitter
Ranked cocktail list by ingredient match
Expanded recipe detail with glass, ingredients, steps, garnish
Shopping suggestions for 1-2 missing ingredients
Generated cocktail database from TheCocktailDB plus curated cocktail names
Bottom navigation with compact icon markers and larger tap zones
Compact cocktail cards
Dedicated bar screen
Dedicated recipe detail screen
Save selected home bar on device with AsyncStorage
Optional account tab for Supabase email/password sign-in and cloud bar sync
Production account flow with sign-up, sign-in, password reset, and password update after recovery link
Favorite cocktails sync through Supabase user_favorites
Light production UI pass with centered desktop layout, cleaner section structure, updated cards, and revised account screen
Account-local AsyncStorage keys are separated by user id; guest data is imported only after a real guest-to-account sign-in
```

## Данные

Snapshot на 2026-05-16:

```text
Cocktails: 72
Ingredients: 90
Recipe ingredient links: 279
Starter ingredients: 18
```

Ingredient categories:

```text
spirit: 20
liqueur: 22
mixer: 18
other: 19
citrus: 7
sweetener: 7
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
Existing Let's Encrypt certificate
```

Current deployment workflow:

```text
Local edit -> type-check/build/test -> commit -> push to GitHub main.
GitHub Actions builds Expo web export and deploys dist/ to VPS over SSH.
Workflow file: .github/workflows/deploy.yml
Required GitHub secret: VPS_SSH_KEY
Optional GitHub secrets for cloud sync build: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
Server deploy key comment: github-actions-home-bar
Password SSH was left enabled on the VPS.
```

Recent deployment state:

```text
VPS was cleaned on 2026-05-01.
Old KIKU files and services were backed up to /root/home-bar-cleanup-backups/20260501-131803 before removal.
Production UI/auth pass was deployed to https://kreisphoto.de/ through GitHub Actions on 2026-06-07.
App change commit:
  e940a7c Polish production UI and account sync
GitHub Actions deploy succeeded:
  https://github.com/sergkreis/Home-bar/actions/runs/27084502544
Production check after deploy:
  https://kreisphoto.de/ returned 200 OK.
  Current deployed JS bundle: /_expo/static/js/web/index-44caf7dbdce743e29aaceb4374f08f17.js
  Production Playwright smoke suite passed: 6 passed.
  Supabase env is not configured on production as of this check; account tab shows local-only mode.
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

Playwright UI tests:

```bash
npm run test:ui
npm run test:ui:headed
```

Run UI tests against production:

```bash
$env:PLAYWRIGHT_BASE_URL='https://kreisphoto.de'; npm run test:ui
```

Regenerate cocktail data:

```bash
npm run import:cocktails
```

Supabase setup:

```text
1. Create Supabase project.
2. Run supabase/schema.sql in Supabase SQL Editor.
3. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY locally or as GitHub Actions secrets.
4. Without these env vars the app stays in local-only mode.
5. Configure Auth site URL/redirect URLs so sign-up confirmation and password recovery return to the deployed domain.
```

Frontend skill bundle to use for future web app work:

```text
C:\Users\Sergej\.codex\plugins\cache\openai-curated\build-web-apps\dc902811\skills\
```

Relevant skills for this project:

```text
frontend-app-builder        - redesign/restyle/modernization and visual concept fidelity work
frontend-testing-debugging  - rendered UI testing, responsive checks, console/layout/debugging loops
react-best-practices        - React performance/refactor guidance for component changes
```

Notes:

```text
Prefer the Browser plugin / in-app browser for rendered frontend QA when available.
Use Playwright as fallback or for the existing tests/home-bar.spec.ts workflow.
shadcn, Stripe, and Supabase skills are not currently relevant unless the project adopts those stacks.
```

Last local verification on 2026-05-16:

```text
npx tsc --noEmit
npm run build:web
npm run test:ui
```

Result:

```text
Type-check passed.
Static web build passed and postprocessed PWA metadata into dist/.
Playwright smoke test passed: 4 passed.
Browser QA against http://127.0.0.1:8091/ passed for page identity, lang=ru, manifest link, viewport-fit=cover, and console health.
Isolated Playwright mobile QA passed: onboarding -> starter bar -> main app opens at scrollTop 0.
Expo still warns that expo and @react-native-async-storage/async-storage should be aligned to expected SDK 54 versions.
```

## Git/GitHub Notes

```text
GitHub remote: https://github.com/sergkreis/Home-bar.git
Current deploy path is GitHub Actions, not manual server copy.
gh CLI was not available in PATH during previous work.
Local branch after latest deploy: main...origin/main, clean.
```

## Текущая Незавершенная Работа

```text
Registration/account sync is implemented as an optional Supabase-backed flow for bar and favorites; it still needs real Supabase project credentials, schema execution, redirect URL configuration, and end-to-end QA against that project.
GitHub Secrets include VPS_SSH_KEY, EXPO_PUBLIC_SUPABASE_URL, and EXPO_PUBLIC_SUPABASE_ANON_KEY for the Supabase project created on 2026-06-07.
AsyncStorage persistence plus optional remote sync lives in src/hooks/useSavedBar.ts and is covered by UI reload tests, but should still be checked on actual phones after UX changes.
App.tsx still does too much: screen switching, filtering, shopping suggestions, and layout remain together.
Generated data still contains a mix of translated Russian names and raw English ingredient names.
PWA build pass now adds /manifest.json, lang=ru, viewport-fit=cover, apple mobile metadata, and install icons during npm run build:web.
UI tests default to local Expo web server unless PLAYWRIGHT_BASE_URL is set.
Deployment still uses root over SSH in GitHub Actions; consider a restricted deploy user later.
Bundle size increased after adding supabase-js; consider lazy-loading auth if this becomes a performance issue.
```

## Известные Review Notes

```text
CocktailResults was updated to reset expanded card when result list changes.
scripts/import-cocktails.mjs was fixed so gin no longer matches inside ginger.
Carbonated water is normalized to soda-water.
Design pass on 2026-05-02:
  IngredientPicker now has featured common ingredients and collapsible categories.
  Onboarding disabled registration button was replaced with an account-later info block.
  Bottom nav has compact icon markers and larger tap zones.
  Quick-mode cards have amber/teal/berry accent strips.
Smoke test was updated to expect "Аккаунт позже" instead of "Зарегистрироваться".
PWA/mobile pass on 2026-05-16:
  scripts/postprocess-web-export.mjs patches dist/index.html and writes manifest/install icons after expo export.
  package.json build:web now runs expo export plus the postprocess script.
  App.tsx ScrollViews have screen/tab keys so onboarding -> app transitions open at top on mobile.
  AsyncStorage persistence moved from App.tsx to src/hooks/useSavedBar.ts.
Account sync pass on 2026-05-25:
  Added @supabase/supabase-js and react-native-url-polyfill.
  Aligned Expo SDK dependencies with expo install: expo ~54.0.34 and AsyncStorage 2.2.0.
  Added AccountPanel and account tab.
  Added optional Supabase client and auth hook.
  Added user_bars upsert/load service and RLS SQL schema.
  GitHub Actions now passes optional EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY secrets into build.
Production UI/auth pass on 2026-06-07:
  Switched from dark dashboard styling to a lighter production UI with centered desktop content.
  Made SectionPanel unframed so cards are not nested inside cards.
  Reworked onboarding, today, recipe cards, buy suggestions, detail screen, bottom nav, and account panel.
  Added password reset/update support to useAuth and AccountPanel.
  Added user_favorites cloud sync service, useFavorites remote merge/save, and RLS SQL schema.
  Saved local bar/favorites now merge with remote data after sign-in instead of blindly replacing local state.
UI refinement pass on 2026-06-07:
  Added lucide-react-native and react-native-svg for proper SVG icons.
  Bottom nav and FavoriteButton now use line icons instead of text symbols.
  Today tab now uses a lighter plan card and compact icon quick-mode cards instead of a large dark hero plus wide pastel bars.
  Lucide imports intentionally target individual CJS icon files to keep the Expo web bundle near 1 MB; Metro warns about private package exports, but root imports pulled the bundle to about 2.74 MB.
Account isolation pass on 2026-06-07:
  useSavedBar and useFavorites now wait for auth readiness before choosing guest/account storage.
  Authenticated local storage keys are scoped by user id, preventing one account's bar/favorites from leaking into another account on the same device.
  Guest bar/favorites are carried into Supabase only on explicit guest-to-account sign-in, not on restored sessions.
Supabase enablement on 2026-06-07:
  User created the Supabase project and ran supabase/schema.sql successfully in SQL Editor.
  GitHub Actions secrets EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY were added.
  Deployed commit b1ec616; live smoke confirmed account form is visible and local-only mode is gone.
```

## Следующие Шаги

```text
1. Configure Supabase Auth site URL/redirect URLs for the production domain if not already saved.
2. Test sign-up/sign-in/password recovery/bar sync/favorites sync on web and actual phones.
3. Split App.tsx tab/detail/onboarding screens into separate components once current changes are accepted.
4. Add unit tests around account-local merge behavior and remote sync edge cases.
5. Add unit tests around matching/shopping logic before expanding the database further.
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
