#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/home-bar"
BACKUP_ROOT="/root/home-bar-predeploy-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$STAMP"

if [[ "${CONFIRM_HOME_BAR_PREPARE:-}" != "yes" ]]; then
  echo "Dry run only. Set CONFIRM_HOME_BAR_PREPARE=yes to move old KIKU files and install nginx config."
  echo
  echo "Would create:"
  echo "  $APP_ROOT"
  echo "  $BACKUP_DIR"
  echo
  echo "Would back up and disable:"
  echo "  /var/www/kiku-site"
  echo "  /etc/nginx/conf.d/kiku-site.conf"
  echo "  /opt/kiku-booking"
  echo "  /etc/kiku-booking.env"
  echo "  /var/lib/kiku-booking"
  echo "  /etc/systemd/system/kiku-booking.service"
  exit 0
fi

mkdir -p "$APP_ROOT" "$BACKUP_DIR"

if systemctl list-unit-files | grep -q '^kiku-booking.service'; then
  systemctl stop kiku-booking.service || true
  systemctl disable kiku-booking.service || true
fi

for path in \
  /var/www/kiku-site \
  /etc/nginx/conf.d/kiku-site.conf \
  /opt/kiku-booking \
  /etc/kiku-booking.env \
  /var/lib/kiku-booking \
  /etc/systemd/system/kiku-booking.service
do
  if [[ -e "$path" ]]; then
    mv "$path" "$BACKUP_DIR/"
  fi
done

systemctl daemon-reload
chown -R nginx:nginx "$APP_ROOT"

echo "Prepared $APP_ROOT"
echo "Backed up old KIKU files to $BACKUP_DIR"

