#!/bin/bash
# Run on a fresh Amazon Linux 2023 EC2 instance (as root or with sudo).
# From the repo root on the instance: sudo bash server/deploy/ec2-setup.sh
set -euo pipefail

APP_DIR=/opt/fsh-api
ENV_FILE=/etc/fsh-api.env
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo."
  exit 1
fi

echo "Installing Node.js..."
dnf install -y nodejs

if ! id fsh &>/dev/null; then
  useradd --system --home-dir "$APP_DIR" --shell /sbin/nologin fsh
fi

echo "Installing app to $APP_DIR..."
mkdir -p "$APP_DIR/data"
cp "$REPO_ROOT/server/index.js" "$REPO_ROOT/server/lib.js" "$APP_DIR/"
chown -R fsh:fsh "$APP_DIR"

if [[ ! -f $ENV_FILE ]]; then
  ADMIN_KEY="$(openssl rand -hex 24)"
  cat >"$ENV_FILE" <<EOF
PORT=3000
ADMIN_API_KEY=$ADMIN_KEY
DATA_DIR=$APP_DIR/data
EOF
  chmod 600 "$ENV_FILE"
  echo ""
  echo "Created $ENV_FILE"
  echo "ADMIN_API_KEY=$ADMIN_KEY"
  echo "Save this key — you need it for puzzle uploads."
  echo ""
else
  echo "Keeping existing $ENV_FILE"
fi

cp "$REPO_ROOT/server/deploy/fsh-api.service" /etc/systemd/system/fsh-api.service
systemctl daemon-reload
systemctl enable fsh-api
systemctl restart fsh-api

PUBLIC_IP="$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || true)"
echo ""
echo "Fsh API is running."
echo "  Health:  http://${PUBLIC_IP:-YOUR_EC2_IP}:3000/health"
echo "  Daily:   http://${PUBLIC_IP:-YOUR_EC2_IP}:3000/daily?date=$(date +%Y-%m-%d)"
echo ""
echo "Set in your local .env:"
echo "  EXPO_PUBLIC_API_URL=http://${PUBLIC_IP:-YOUR_EC2_IP}:3000"
echo "  FSH_API_URL=http://${PUBLIC_IP:-YOUR_EC2_IP}:3000"
echo "  FSH_ADMIN_API_KEY=<from $ENV_FILE>"
