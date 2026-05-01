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
RAM: 873 MiB total, about 483 MiB available during audit
Swap: none
Disk: 10 GB total, 4.5 GB free on /
```

Current web stack:

```text
nginx listens on 80/443
kreisphoto.de and www.kreisphoto.de point to 212.227.28.224
Let's Encrypt certificate for kreisphoto.de and www.kreisphoto.de is valid until 2026-07-17
```

Old KIKU paths found on the server:

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
kiku-booking.service is already inactive and disabled.
The server also has unrelated-looking components such as Docker, warp-svc, /opt/marzban, /opt/tblocker, and a high-CPU v2iplimit process. Do not remove those as part of the KIKU cleanup unless explicitly confirmed.
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
3. Back up the current KIKU site and config.
4. Stop/disable KIKU booking service if still present.
5. Move old KIKU files to a dated backup directory.
6. Install `deploy/nginx-home-bar.conf` as `/etc/nginx/conf.d/home-bar.conf`.
7. Remove or disable `/etc/nginx/conf.d/kiku-site.conf`.
8. Copy the new static files to `/var/www/home-bar`.
9. Run `nginx -t`.
10. Reload nginx.
11. Check `https://kreisphoto.de/` and `https://www.kreisphoto.de/`.

Do not perform steps 3-10 until deployment is explicitly approved.

