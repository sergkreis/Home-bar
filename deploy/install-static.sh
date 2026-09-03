#!/usr/bin/env bash
# Home Bar static deploy. Installed on the VPS as /usr/local/sbin/home-bar-install-static (root:root 0755)
# and invoked by the unprivileged `deploy` user through sudo (see /etc/sudoers.d/home-bar-deploy).
# Changing this file in the repo does NOT update the server copy — a root must reinstall it by hand.
set -euo pipefail

APP_ROOT="/var/www/home-bar"
NGINX_CONF_TARGET="/etc/nginx/conf.d/home-bar.conf"
USAGE="usage: home-bar-install-static <home-bar-dist.tar.gz> <nginx-home-bar.conf>"
ARCHIVE="${1:?$USAGE}"
NGINX_CONF_SOURCE="${2:?$USAGE}"

[[ -f "$ARCHIVE" ]] || { echo "Missing archive: $ARCHIVE" >&2; exit 1; }
[[ -f "$NGINX_CONF_SOURCE" ]] || { echo "Missing nginx config: $NGINX_CONF_SOURCE" >&2; exit 1; }

# Extract into a root-owned staging dir so nothing writable by the deploy user is ever rsynced as-is.
STAGE="$(mktemp -d /var/tmp/home-bar-dist.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
tar -xzf "$ARCHIVE" -C "$STAGE"
[[ -f "$STAGE/index.html" ]] || { echo "Archive has no index.html" >&2; exit 1; }

mkdir -p "$APP_ROOT"
rsync -a --delete "$STAGE"/ "$APP_ROOT"/
install -m 644 -o root -g root "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
chown -R nginx:nginx "$APP_ROOT"

nginx -t
systemctl reload nginx
rm -f "$ARCHIVE" "$NGINX_CONF_SOURCE"

echo "Home Bar deployed to $APP_ROOT: $(grep -oE '_expo/static/js/web/[A-Za-z0-9._-]+\.js' "$APP_ROOT/index.html" | head -1)"
