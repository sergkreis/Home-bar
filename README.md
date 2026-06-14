# Домашний бар

Телефонно-ориентированное веб-приложение на Expo и React Native Web для подбора коктейлей из того, что уже есть дома. Пользователь отмечает ингредиенты домашнего бара, а приложение показывает, что можно смешать сейчас, что почти готово и что выгоднее докупить.

Продакшен: https://kreisphoto.de/

## Возможности

- подбор коктейлей по ингредиентам домашнего бара;
- быстрые сценарии вечера: без заморочек, свежее, покрепче;
- фильтр по вкусу: освежающее, сладкое, кислое, крепкое, горькое;
- поиск по ингредиентам;
- рейтинг совпадений и список недостающих ингредиентов;
- детальная карточка рецепта с бокалом, составом, шагами и подачей;
- подсказки, какие 1-2 ингредиента докупить, чтобы открыть больше рецептов;
- локальное сохранение бара и избранного;
- регистрация, вход, восстановление пароля и синхронизация бара/избранного/профиля через Supabase;
- отдельные настройки аккаунта: имя и дата рождения;
- авторские иллюстрации для всей базы коктейлей.

## Текущий объем базы

- 81 коктейль;
- 99 ингредиентов;
- 310 связей рецепт-ингредиент;
- 18 стартовых ингредиентов для первого запуска;
- 81 PNG-иллюстрация коктейлей в `assets/drinks`.

Данные генерируются из TheCocktailDB и дополнительного curated-списка классических коктейлей. Иллюстрации подключаются через `src/components/DrinkArt.tsx`.

## Технологии

- Expo SDK 54;
- React 19;
- React Native 0.81;
- React Native Web;
- TypeScript strict mode;
- `@react-native-async-storage/async-storage` для локального сохранения;
- Supabase Auth + Postgres для аккаунтов и облачной синхронизации;
- Playwright для UI smoke-тестов;
- GitHub Actions deploy на VPS/nginx.

## Запуск

Установить зависимости:

```bash
npm install
```

Запустить Expo:

```bash
npm start
```

Запустить web-версию:

```bash
npm run web
```

Собрать статическую web-версию для nginx:

```bash
npm run build:web
```

Проверить TypeScript:

```bash
npx tsc --noEmit
```

Запустить unit-тесты:

```bash
npm test
```

Запустить UI-тесты:

```bash
npm run test:ui
```

Перегенерировать базу коктейлей:

```bash
npm run import:cocktails
```

## Supabase

Облачная синхронизация включается только если заданы публичные Expo-переменные:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Для локальной разработки можно скопировать `.env.example` в `.env`. Для GitHub Actions deploy эти же значения должны быть в repository secrets.

SQL-схема с RLS находится в `supabase/schema.sql`. Ее нужно выполнить в Supabase SQL Editor перед полноценной проверкой аккаунтов. Схема создает:

- `user_bars`;
- `user_favorites`;
- `user_profiles`;
- RLS policies для доступа только к своим данным.

Supabase Auth должен иметь корректные production redirect URLs для `https://kreisphoto.de/`. Почтовые письма подтверждения/восстановления настраиваются в Supabase Dashboard; для красивой отправки используется внешний SMTP/Resend.

## Структура

```text
App.tsx                              основной экран и временное переключение экранов
assets/drinks/                       81 сгенерированная PNG-иллюстрация коктейлей
src/components/                      UI-компоненты
src/components/DrinkArt.tsx          маппинг cocktail id -> PNG-иллюстрация
src/hooks/useAuth.ts                 состояние Supabase Auth
src/hooks/useSavedBar.ts             локальное сохранение + облачная синхронизация бара
src/hooks/useFavorites.ts            локальное избранное + облачная синхронизация избранного
src/hooks/useUserProfile.ts          загрузка/сохранение профиля аккаунта
src/lib/supabase.ts                  Supabase client
src/services/userBarService.ts       чтение/запись user_bars
src/services/userFavoritesService.ts чтение/запись user_favorites
src/services/userProfileService.ts   чтение/запись user_profiles
src/data/                            сгенерированные данные коктейлей и ингредиентов
src/utils/cocktailMatcher.ts         ранжирование коктейлей по совпадению
src/utils/shoppingAdvisor.ts         рекомендации, что докупить
scripts/import-cocktails.mjs         импорт и нормализация данных из TheCocktailDB
scripts/postprocess-web-export.mjs   PWA metadata после Expo export
supabase/schema.sql                  Supabase tables/RLS
deploy/                              nginx/VPS deploy scripts
tests/home-bar.spec.ts               Playwright smoke-тесты
HANDOVER.md                          состояние проекта для будущих сессий Codex
```

## Деплой

Основной путь деплоя:

```text
local change -> checks -> commit -> push to main -> GitHub Actions -> VPS/nginx
```

Workflow: `.github/workflows/deploy.yml`

Продакшен:

```text
https://kreisphoto.de/
```

Перед деплоем обычно прогоняются:

```bash
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
```

## Ближайшие задачи

- провести отдельную QA-проверку аккаунтов на реальных телефонах;
- улучшить админский редактор базы коктейлей;
- продолжить нормализацию рецептов, ингредиентов и единиц измерения;
- оптимизировать вес PNG-ассетов, если загрузка на мобильных станет тяжелой;
- вынести крупные части `App.tsx` в отдельные экраны/компоненты;
- обновить GitHub Actions под Node 24, когда actions runner окончательно уйдет с Node 20.
