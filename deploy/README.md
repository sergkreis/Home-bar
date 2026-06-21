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
Node.js 20 via actions/setup-node@v4
npm install --no-audit --no-fund
npx tsc --noEmit
npm run build:web
tar dist/
scp archive and deploy scripts to VPS
run deploy/install-static.sh over SSH
```

GitHub currently warns that Node.js 20 actions are deprecated. Update the workflow to Node 24 when the installed toolchain is confirmed compatible.

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

The GitHub Actions workflow still connects as `root` over SSH. This works for the small VPS, but the preferred future improvement is a restricted deploy user with narrow sudo permissions for static file install and nginx reload.

Password SSH was previously left enabled on the VPS. Do not disable it without an explicit separate decision from the user.
