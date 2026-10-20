# Android-кандидат для друзей (18+; не релиз Play)

Исходник: ветка `tim/android-candidate-privacy-cleanup` от `4f5b058`; перед сборкой зафиксировать конкретный commit и проверить `git status --short`, `git rev-parse HEAD`. Не собирать из незакоммиченных/непроверенных файлов. APK для прямой установки ≠ AAB для Play. `expo export --platform android` создаёт только JS/Hermes assets, НЕ APK.

## Что нужно до нативной сборки

- На отдельной сборочной машине: совместимые Java/JDK, Android SDK/build-tools, место для Gradle/NDK; установленный и авторизованный EAS CLI (`eas --version`, `eas whoami`, `eas project:info`). На текущей VM нет Java, adb, Android SDK, Gradle, bundletool, EAS CLI, apkanalyzer/aapt/keytool/zipalign; ничего не скачивали. `app.json` содержит owner `sergkreiss-team`, projectId `176f9f21-0e28-4848-9751-e786666f6fe5`, package `app.inmybar`, version `1.0.0`; `eas.json` задаёт remote versionCode. Доступность проекта/подписи/versionCode в EAS НЕ проверена. Метаданные credentials проверять через `eas credentials --platform android` в приватном терминале без вывода ключей, паролей, JSON и keystore в отчёт. В этой ветке ключи не менять.
- Для облачной синхронизации нужны публичные `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY` в корректном профиле сборки; проверить их наличие без раскрытия значений. Это публичные client-параметры, не service-role. Backend не менялся. В Supabase Auth URL Configuration владелец должен подтвердить allowlist точного `inmybar://auth/callback` и шаблоны писем для confirmation/recovery. Нельзя заявить работающий email-flow без живого теста. Схема в `app.json` требует нового native build; Expo Go с нестабильным `exp://` не годится для проверки. PKCE code verifier хранится на устройстве-инициаторе: письмо открывать на том же устройстве и в том же установленном приложении; сценарий другого устройства отдельно отклонять/объяснять. Не добавлять wildcard redirect и не менять live Supabase без явного разрешения.

## Команды после разрешения на сборку

```sh
cd /home/hermes/reviews/homebar-play-audit
git status --short && git rev-parse HEAD
npm ci --no-audit --no-fund
./node_modules/.bin/tsc --noEmit
npm test
npm run test:ui
./node_modules/.bin/expo export --platform android --output-dir /tmp/homebar-android-js-check
# На подготовленной локальной Android-машине, после проверки EAS аккаунта/credentials:
eas build --platform android --profile preview --local --non-interactive
# Только после отдельного разрешения на production-profile build: remote versionCode + autoIncrement
# могут менять состояние EAS даже с --local. Не делать submit.
eas build --platform android --profile production --local --non-interactive
```

`preview` = internal-distribution APK для друзей; `production` = AAB-кандидат Play (НЕ публикация). Локальный EAS всё равно может обращаться к Expo credentials/version API; проверить полномочия и стоимость/политику до запуска. Ни один из этих native build commands здесь НЕ исполнялся. Cloud EAS, `eas submit`, Play Console, signing-key mutation и публикация вне scope. Если EAS credentials недоступны, нужно отдельное решение владельца о проверенном локальном Gradle signing path; не генерировать новый ключ автоматически.

После сборки привязать APK/AAB к SHA и сохранить в защищённом месте. Инспектировать package `app.inmybar`, versionCode/versionName, targetSdk/compileSdk/minSdk, permissions и merged manifest, подпись/сертификат без приватного ключа, ABI/native `.so` и 16 KB alignment (`bundletool`, `apkanalyzer`, `aapt`, `zipalign`, `keytool`/`jarsigner` по типу артефакта); сравнить с актуальными требованиями Play. Значения из `app.json` не доказывают значения manifest.

## Ручная приёмка APK на реальном Android

1. Чистая установка и обновление поверх предыдущей версии (без потери гостевого бара), 18+ gate; политика до подтверждения возраста, на гостевом экране аккаунта, в диалоге входа, в авторизованном аккаунте; внешний браузер и понятное сообщение при отсутствии обработчика/сети.
2. Гость: стартовый/пустой бар, поиск/фильтры, подбор, избранное, докупка ингредиентов, перезапуск, offline/online, системная Back, тёмный режим и 320px/малый экран. Алкогольная тематика строго 18+; не позиционировать как детское приложение.
3. С backend, подтверждённым владельцем: регистрация, письмо и возврат в установленный APK по `inmybar://auth/callback`, восстановление пароля и форма нового пароля, вход/выход/повторный вход, конфликт синхронизации на двух устройствах. Проверить невалидную/устаревшую ссылку и письмо, открытое на другом телефоне. Не использовать реальные пользовательские аккаунты без разрешения.
4. Тестовый аккаунт: сделать записи, выйти, убедиться, что account-scoped AsyncStorage bar/favorites очищены, а гостевые данные сохранились; войти вновь — облачные данные загрузились. Удалить тестовый аккаунт через UI, убедиться в удалении на backend и устройстве, невозможности повторного входа; отдельно проверить внешний email-запрос удаления по политике. Код/RPC не заменяет live-проверку каскада, backups и удаления в провайдерах.
5. TalkBack/фокус/озвучивание ссылки, размер шрифта, контраст, поворот, отсутствие крашей. Отчёт о сбоях и Data safety составлять по собранному APK и реальной конфигурации: email, возможные имя/дата рождения, бар/избранное, local age flag, Supabase/Resend и условный error endpoint; web Matomo не приписывать Android без проверки. В privacy policy утверждения о регионе/сроке хранения, «сразу и безвозвратно», обработке email-запросов должен подтвердить владелец; backup retention неизвестен.

Только после этой приёмки и инспекции AAB отдельно решать Play internal/closed test, listing/IARC, adult audience, privacy/deletion URL, Data safety, signing и публикацию. Не выбирать production до этого.
