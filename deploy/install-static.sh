#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/home-bar"
UPLOAD_ROOT="${1:-/tmp/home-bar-dist}"
NGINX_CONF_SOURCE="${2:-/tmp/nginx-home-bar.conf}"
NGINX_CONF_TARGET="/etc/nginx/conf.d/home-bar.conf"

if [[ ! -d "$UPLOAD_ROOT" ]]; then
  echo "Missing upload directory: $UPLOAD_ROOT" >&2
  exit 1
fi

if [[ ! -f "$NGINX_CONF_SOURCE" ]]; then
  echo "Missing nginx config: $NGINX_CONF_SOURCE" >&2
  exit 1
fi

mkdir -p "$APP_ROOT"
rsync -a --delete "$UPLOAD_ROOT"/ "$APP_ROOT"/
cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
chown -R nginx:nginx "$APP_ROOT"

nginx -t
systemctl reload nginx

echo "Home Bar deployed to $APP_ROOT"

