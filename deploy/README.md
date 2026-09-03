# Deploy Notes

Production domain:

```text
kreisphoto.de
www.kreisphoto.de
```

Production URL:

```text
https://kreisphoto.de/
```

Target VPS:

```text
212.227.28.224
Debian 12
nginx 1.28
```

The app is deployed as a static Expo web export behind nginx. No Node.js process is required on the server.

## Current Deploy Flow

Deployment is handled by GitHub Actions after a push to `main`.

```text
local checks -> commit -> push origin main -> GitHub Actions -> VPS/nginx
```

Workflow:

```text
.github/workflows/deploy.yml
```

Required GitHub secrets:

```text
VPS_SSH_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Current workflow details:

```text
Node.js 24 via actions/setup-node@v6
npm ci --no-audit --no-fund
npx tsc --noEmit
npm test
npm run build:web
tar dist/
scp archive + nginx conf to /tmp on the VPS as the unprivileged `deploy` user
ssh deploy@VPS 'sudo -n /usr/local/sbin/home-bar-install-static /tmp/home-bar-dist.tar.gz /tmp/nginx-home-bar.conf'
```

Since 2026-09-03 the workflow no longer logs in as root. The server-side installer is a root-owned copy of
`deploy/install-static.sh` at `/usr/local/sbin/home-bar-install-static`; `/etc/sudoers.d/home-bar-deploy`
lets the `deploy` user run only that script. If you change `deploy/install-static.sh`, a root must reinstall
the server copy by hand — the workflow does not ship it anymore.

## Current Production State

Last verified on 2026-06-21:

```text
Commit: 2013e52 Add stale service worker cleanup
GitHub Actions run: https://github.com/sergkreis/Home-bar/actions/runs/27912173646
URL: https://kreisphoto.de/
Production bundle: /_expo/static/js/web/index-0c5e33e03d027db7c1a7c0669165bf84.js
HTML cache-control: no-cache, no-store, must-revalidate
/sw.js and /service-worker.js: 200 OK, application/javascript, no-store, Service-Worker-Allowed: /
```

Chrome and Safari on the local Mac were checked after deploy. The Safari report of
an "old" site was the current first-run onboarding state; the manual path is:
confirm age, press `Стартовый`, then press `Подобрать коктейли`.

## Server Layout

```text
/var/www/home-bar                  static web root served by nginx
/etc/nginx/conf.d/home-bar.conf    nginx vhost config installed by deploy script
/tmp/home-bar-dist.tar.gz          temporary upload archive during deploy
/tmp/home-bar-dist                 temporary extracted build during deploy
```

Historical/optional source checkout path:

```text
/srv/home-bar
```

## Manual Build

```bash
npm install
npm run build:web
```

The static build is written to:

```text
dist/
```

The web export postprocess step writes `/sw.js` and `/service-worker.js` as cleanup
service workers. They unregister old browser/PWA workers and clear stale Cache
Storage, so keep the matching nginx `no-store` locations in
`deploy/nginx-home-bar.conf`.

## Manual Cutover Checklist

Use this only if GitHub Actions is unavailable.

1. Build locally with `npm run build:web`.
2. Upload `dist/` to a temporary server path.
3. Copy the new static files to `/var/www/home-bar`.
4. Run `nginx -t`.
5. Reload nginx.
6. Check `https://kreisphoto.de/` and `https://www.kreisphoto.de/`.

Do not do manual deploys unless GitHub Actions is unavailable or the user explicitly asks for a manual server deploy.

## Server Audit From 2026-05-01

Resources at the time of cleanup:

```text
CPU: 1 vCPU, AMD EPYC-Milan
RAM: 873 MiB total, about 591 MiB available after cleanup
Swap: none
Disk: 10 GB total, 5.8 GB free on / after cleanup
```

Current web stack from that audit:

```text
nginx listens on 80/443
kreisphoto.de and www.kreisphoto.de point to 212.227.28.224
Let's Encrypt certificate for kreisphoto.de and www.kreisphoto.de was valid until 2026-07-17 at the audit time
```

Before certificate-sensitive work, re-check the certificate because this date is not a current guarantee.

## Cleanup History

Cleanup was completed on 2026-05-01.

Backups are stored on the server under:

```text
/root/home-bar-cleanup-backups/20260501-131803
```

Old KIKU paths removed from the server:

```text
/var/www/kiku-site
/etc/nginx/conf.d/kiku-site.conf
/opt/kiku-booking
/etc/kiku-booking.env
/var/lib/kiku-booking
/etc/systemd/system/kiku-booking.service
```

Other removed/cleaned services and leftovers:

```text
Docker
Cloudflare WARP
/opt/marzban
/opt/tblocker
igipu.ru certificate files
v2iplimit leftovers
```

The server was left with nginx, certbot, SSH, the kreisphoto.de certificate, `/srv/home-bar`, and `/var/www/home-bar`.

## Security Notes

The GitHub Actions workflow connects as the `deploy` user (key comment `github-actions-home-bar-deploy`),
which can only run `/usr/local/sbin/home-bar-install-static` through sudo. The old root deploy key was removed
from `/root/.ssh/authorized_keys` on 2026-09-03.

Password SSH was previously left enabled on the VPS. Do not disable it without an explicit separate decision from the user.

## Мобильные Сборки (EAS)

Профили сборки описаны в `eas.json`:

```text
development  APK с dev-client для отладки
preview      internal APK, чтобы разослать тестировщикам ссылкой
production   AAB для Google Play (versionCode ведёт EAS, appVersionSource=remote)
```

Перед первой сборкой нужен аккаунт Expo и переменные окружения в EAS
(`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) — без них
приложение соберётся в локальном режиме без аккаунтов.

```bash
npx eas login
npx eas init            # привязывает проект, дописывает extra.eas.projectId в app.json
npx eas build --platform android --profile preview      # APK для теста
npx eas build --platform android --profile production   # AAB для Play
npx eas submit --platform android --latest              # загрузка в Play Console
```

Ключ подписи Android генерирует и хранит EAS. Его нельзя терять: без него
обновить уже опубликованное приложение невозможно.
