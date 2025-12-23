# VPS Deploy (nginx / systemd / certbot)

This folder contains simple helper scripts and config snippets for deploying BuildBrain on an Ubuntu VPS.

Prereqs (on the server):
- docker & docker-compose (v2) installed
- nginx
- certbot (for Let's Encrypt)

Quick steps (example):

1. Clone repository to `/opt/buildbrain` or copy `docker-compose.yml` to `/opt/buildbrain`.

2. Place the nginx site file at `/etc/nginx/sites-available/buildbrain` and symlink to `/etc/nginx/sites-enabled/`.

3. Create directory for certbot challenge files:

```bash
sudo mkdir -p /var/www/certbot
sudo chown www-data:www-data /var/www/certbot
```

4. Obtain certificates (replace domain):

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d buildbrain.example.com
```

5. Start docker stack using systemd unit or the `deploy.sh` helper:

```bash
sudo cp buildbrain.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now buildbrain.service
# or
sudo ./deploy.sh deploy
```

Notes:
- Replace `buildbrain.example.com` with your domain in `nginx/buildbrain.conf` before enabling.
- Add `STRIPE_WEBHOOK_SECRET` to your environment or to the service runner so the `payment-service` can verify incoming webhooks.
 - Add `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY` to your environment or to the service runner so the `payment-service` can verify incoming webhooks and create test intents.
 - If using the included MongoDB in the compose stack, set `MONGO_URL` and `MONGO_DB` appropriately (defaults: `mongodb://mongo:27017`, `buildbrain`).
