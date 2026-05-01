# Domashniy Bar - Handover

Последнее обновление: 2026-05-02

## Быстрый Контекст

Domashniy Bar - phone-oriented Expo / React Native Web / TypeScript приложение для подбора коктейлей из ингредиентов, которые уже есть дома.

Глобальный индекс проектов:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```

## Пути И Репозиторий

Локальный путь:

```text
C:\Users\Sergej\Documents\Codex\domashniy-bar
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
```

## Основные Файлы

```text
App.tsx                         - главный экран, state, screen switching, onboarding
src/components/                 - reusable UI components
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
Future registration CTA placeholder
Home screen with summary counters
Ingredient picker grouped by category
Ingredient search inside picker
"What to drink tonight" quick modes
Taste filters: refreshing, sweet, sour, strong, bitter
Ranked cocktail list by ingredient match
Expanded recipe detail with glass, ingredients, steps, garnish
Shopping suggestions for 1-2 missing ingredients
Generated cocktail database from TheCocktailDB plus curated cocktail names
Bottom navigation
Compact cocktail cards
Dedicated bar screen
Dedicated recipe detail screen
Save selected home bar on device with AsyncStorage
```

## Данные

Snapshot на 2026-05-01:

```text
Cocktails: 72
Ingredients: 93
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
Server deploy key comment: github-actions-home-bar
Password SSH was left enabled on the VPS.
```

Recent deployment state:

```text
VPS was cleaned on 2026-05-01.
Old KIKU files and services were backed up to /root/home-bar-cleanup-backups/20260501-131803 before removal.
The current Expo Web build was deployed to https://kreisphoto.de/ through GitHub Actions on 2026-05-02.
GitHub Actions run succeeded: https://github.com/sergkreis/Home-bar/actions/runs/25235764223
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

## Git/GitHub Notes

```text
GitHub remote: https://github.com/sergkreis/Home-bar.git
Current deploy path is GitHub Actions, not manual server copy.
gh CLI was not available in PATH during previous work.
```

## Текущая Незавершенная Работа

```text
Registration is only a disabled CTA placeholder.
AsyncStorage persistence is implemented and covered by normal runtime use, but should still be checked on actual phones after UX changes.
App.tsx still does too much: state, persistence, screen switching, filtering, shopping suggestions, layout.
Generated data still contains a mix of translated Russian names and raw English ingredient names.
```

## Известные Review Notes

```text
CocktailResults was updated to reset expanded card when result list changes.
scripts/import-cocktails.mjs was fixed so gin no longer matches inside ginger.
Carbonated water is normalized to soda-water.
```

## Следующие Шаги

```text
1. Review the live app on a phone at https://kreisphoto.de/ and collect UX fixes.
2. Finish the phone-oriented web/PWA pass.
3. Split App.tsx into screens/hooks once MVP behavior is stable.
4. Add a small testable layer around matching/shopping logic before expanding the database further.
5. Later: implement real registration/account sync if needed.
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
