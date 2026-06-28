# TODO

Актуально на 2026-06-28. Секреты, `.env` и приватные ключи здесь не хранить.

## Перед Новым Кодом

1. Проверить `git status --short`.
2. После pull на другом компьютере проверить, что `main` содержит session-close auth fixes от 2026-06-28.
3. После pull/install на другом компьютере прогнать:

```bash
npx tsc --noEmit
npm test
npm run build:web
```

## Ближайшие Задачи

1. QA аккаунтов на реальных телефонах с Supabase env:
   восстановление пароля, сохранение профиля, синхронизация бара и избранного между Windows/Mac/телефоном. Регистрация, email confirmation и авторизованное состояние на Android debug уже проверены 2026-06-28.
2. Проверить Supabase Auth email deliverability: Gmail положил confirmation email в spam, поэтому нужны SPF/DKIM/DMARC и кастомный SMTP/Resend sender.
3. Довести Android/iOS dev-инструкцию до повторяемого checklist для нового компьютера.
4. Улучшить админский редактор базы коктейлей.
5. Продолжить редактуру рецептов: названия ингредиентов, единицы, шаги и русские формулировки.
6. Добавить тесты для account-local isolation, no guest merge after sign-in и remote sync edge cases.
7. Оптимизировать drink assets, если реальная мобильная загрузка станет тяжелой.
8. Разнести `App.tsx` на более мелкие shell/screen/state модули.
9. Обновить GitHub Actions под Node 24 после проверки совместимости.
