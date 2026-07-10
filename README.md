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
- React Native Safe Area Context для корректных отступов на телефонах с вырезами и gesture bar;
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

Запустить Android dev-сборку:

```bash
npm run android
```

Для реального Android-телефона нужны Android SDK, Java из Android Studio, включенная USB-отладка и авторизованный `adb`. Debug APK проверялся на Nothing Phone `A001T` / Android 16 с package id `de.kreisphoto.domashniybar`. Без публичных Supabase env-переменных приложение на телефоне работает в режиме `Локально`: бар и избранное хранятся на устройстве.

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

Supabase Auth должен иметь корректные production redirect URLs для `https://kreisphoto.de/`. Почтовые письма подтверждения/восстановления настраиваются в Supabase Dashboard; для production-доставляемости нужен внешний SMTP/Resend с проверенными SPF/DKIM/DMARC.

Проверено на реальном Android-телефоне 2026-06-28 с заданными `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY`: регистрация, email confirmation и авторизованное состояние после reload работают. Исправлены зависание кнопки на `Проверяем`, native redirect crash и перекрытие password-полей клавиатурой. В ревью 2026-07-10 дополнительно добавлены видимые подписи полей, переключатели видимости пароля и accessibility-состояния. Письмо подтверждения у Gmail попало в spam, поэтому следующая внешняя задача - проверить SMTP/domain deliverability. Также остается полноценная cross-device QA синхронизации бара, избранного, профиля и восстановления пароля.

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
TODO.md                              ближайшие задачи и старт нового чата
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

Текущее локально проверенное состояние на 2026-07-10:

```text
Remote sync writes are serialized and retain the latest pending local state.
Web tabs and cocktail details have stable URLs, browser history and direct-link support.
Header and bottom navigation are covered at 320 px; auth fields have labels and password visibility controls.
GitHub Actions is prepared for Node 24, npm ci and pre-deploy unit tests.
2026-07-10 checks passed: TypeScript, 40 unit tests, Expo Doctor 18/18, web export,
Playwright UI 13 passed / 2 conditional skips, and Android Expo export.
Review fixes were deployed through GitHub Actions on 2026-07-10.
```

Перед деплоем обычно прогоняются:

```bash
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
```

## Ближайшие задачи

- проверить SMTP/domain deliverability для Supabase Auth писем, потому что Gmail отправил confirmation email в spam;
- продолжить QA аккаунтов: восстановление пароля, профиль, синхронизация бара/избранного между Mac, Windows и телефоном на одном аккаунте;
- проверить реальные cross-device конфликты после добавленной очереди remote save;
- довести Android/iOS dev-процедуру до повторяемой инструкции для нового компьютера;
- улучшить админский редактор базы коктейлей;
- продолжить нормализацию рецептов, ингредиентов и единиц измерения;
- оптимизировать вес PNG-ассетов, если загрузка на мобильных станет тяжелой;
- вынести крупные части `App.tsx` в отдельные экраны/компоненты;
- запланировать переход с Expo SDK 54 перед принудительным исправлением оставшихся npm audit предупреждений.
