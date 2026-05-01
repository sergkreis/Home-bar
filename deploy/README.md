# Deploy Notes

Target domain:

```text
kreisphoto.de
www.kreisphoto.de
```

Target VPS:

```text
212.227.28.224
Debian 12
nginx 1.28
```

The app should be deployed as a static Expo web export behind nginx. No Node.js process is required on the server.

## Server Audit From 2026-05-01

Resources:

```text
CPU: 1 vCPU, AMD EPYC-Milan
RAM: 873 MiB total, about 591 MiB available after cleanup
Swap: none
Disk: 10 GB total, 5.8 GB free on / after cleanup
```

Current web stack:

```text
nginx listens on 80/443
kreisphoto.de and www.kreisphoto.de point to 212.227.28.224
Let's Encrypt certificate for kreisphoto.de and www.kreisphoto.de is valid until 2026-07-17
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

Important note:

```text
Cleanup was completed on 2026-05-01.
Backups are stored on the server under /root/home-bar-cleanup-backups/20260501-131803.
Docker, Cloudflare WARP, /opt/marzban, /opt/tblocker, igipu.ru certificate files, and v2iplimit leftovers were removed.
The server now keeps nginx, certbot, SSH, the kreisphoto.de certificate, /srv/home-bar, and /var/www/home-bar.
```

## Local Build

```bash
npm install
npm run build:web
```

The static build is written to:

```text
dist/
```

## Intended Server Layout

```text
/srv/home-bar             source checkout, optional
/var/www/home-bar         static web root served by nginx
/etc/nginx/conf.d/home-bar.conf
```

## Cutover Plan

1. Build locally with `npm run build:web`.
2. Upload `dist/` to a temporary server path.
3. Copy the new static files to `/var/www/home-bar`.
4. Run `nginx -t`.
5. Reload nginx.
6. Check `https://kreisphoto.de/` and `https://www.kreisphoto.de/`.

Do not deploy the actual app until deployment is explicitly approved.
