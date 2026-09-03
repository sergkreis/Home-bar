# TODO

Актуально на 2026-07-10. Секреты, `.env` и приватные ключи здесь не хранить.

## Перед Новым Кодом

1. Проверить `git status --short`.
2. После разрешённого commit/push проверить, что `main` содержит review fixes от 2026-07-10.
3. После pull/install на другом компьютере прогнать:

```bash
npx tsc --noEmit
npm test
npm run build:web
npm run test:ui
```

## Публикация В Google Play (2026-09-03)

1. Сергею: аккаунт Google Play Developer ($25) и аккаунт Expo для EAS Build.
2. Сергею: выполнить в Supabase SQL Editor конец `supabase/schema.sql` — функцию `delete_current_user()`;
   без неё кнопка удаления аккаунта вернёт ошибку.
3. Сергею: посмотреть регион проекта в Supabase (Settings → General) и сказать — уточним `web/privacy.html`.
4. Закрытое тестирование Google: ~12 тестировщиков, 14 дней подряд, до продакшена.
5. Скриншоты, баннер 1024x500, описания для Play Store.
6. Письма Supabase Auth в спам Gmail — критично для мобильных: без подтверждения почты регистрация не завершается.

## Ближайшие Задачи

1. QA аккаунтов на реальных телефонах с Supabase env:
   восстановление пароля, сохранение профиля, синхронизация бара и избранного между Windows/Mac/телефоном. Регистрация, email confirmation и авторизованное состояние на Android debug уже проверены 2026-06-28.
2. Проверить Supabase Auth email deliverability: Gmail положил confirmation email в spam, поэтому нужны SPF/DKIM/DMARC и кастомный SMTP/Resend sender.
3. Довести Android/iOS dev-инструкцию до повторяемого checklist для нового компьютера.
4. Улучшить админский редактор базы коктейлей.
5. Продолжить редактуру рецептов: названия ингредиентов, единицы, шаги и русские формулировки.
6. Добавить hook-level тесты для account-local isolation, no guest merge after sign-in и реальных remote conflict cases. Очередь latest pending save и маршруты уже покрыты unit-тестами.
7. Оптимизировать drink assets, если реальная мобильная загрузка станет тяжелой.
8. Разнести `App.tsx` на более мелкие shell/screen/state модули.
9. Expo SDK 54 → 57 сделан в ветке `chore/expo-sdk-upgrade` (2026-09-03): RN 0.86, React 19.2, vitest 4,
   TypeScript 6, `splash` переехал в плагин `expo-splash-screen`, expo-doctor 21/21, tsc/vitest 55/Playwright 14
   зелёные. npm audit: 31 → 10 moderate, все оставшиеся — внутри Expo CLI/prebuild (dev-only, upstream).
   В main мержить только после проверки превью на телефоне.
