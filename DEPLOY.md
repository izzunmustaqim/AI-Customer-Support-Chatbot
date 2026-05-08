# 🚀 VPS Deployment Guide — GreenCloud

Step-by-step guide to deploy the EECA Chatbot on a GreenCloud VPS.

---

## Step 1: Buy a VPS

Go to [greencloudvps.com](https://greencloudvps.com) and buy:

| Setting | Value |
|---------|-------|
| **Location** | Singapore |
| **OS** | Ubuntu 22.04 LTS |
| **RAM** | 2 GB |
| **Storage** | 40 GB SSD |
| **Plan** | ~$10-15/mo |

After purchase, you'll receive an **IP address** and **root password** by email.

---

## Step 2: Connect to Your VPS

Open PowerShell on your PC:

```bash
ssh root@YOUR_VPS_IP
```

Enter the password from the email.

---

## Step 3: Install Docker

Run these commands on the VPS:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

---

## Step 4: Clone Your Repo

```bash
# Install Git
apt install git -y

# Clone
cd /opt
git clone https://github.com/izzunmustaqim/Compliance-Readiness-Assessment-Tool.git chatbot
cd chatbot
```

---

## Step 5: Set Up Environment Variables

```bash
nano .env.local
```

Paste this (replace with your real keys):

```env
# AI Provider
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase (keep using cloud Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://rdltudmxlfeeiafoiqky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database password (for local PostgreSQL if used)
DB_PASSWORD=your_secure_password_here
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## Step 6: Build and Run

```bash
docker compose up -d --build
```

Wait 2-3 minutes for the build. Check status:

```bash
docker compose ps
docker compose logs chatbot
```

Your app is now running at `http://YOUR_VPS_IP:3000`

---

## Step 7: Set Up HTTPS with Cloudflare Tunnel (Free)

### 7a. Create a Cloudflare account
Go to [cloudflare.com](https://cloudflare.com) and add `sandhurstadvisory.com.my`

### 7b. Install Cloudflare Tunnel on VPS

```bash
# Install cloudflared
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" | tee /etc/apt/sources.list.d/cloudflared.list
apt update && apt install cloudflared -y
```

### 7c. Login and create tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create eeca-chatbot
cloudflared tunnel route dns eeca-chatbot eeca.sandhurstadvisory.com.my
```

### 7d. Configure tunnel

```bash
nano ~/.cloudflared/config.yml
```

Paste:

```yaml
tunnel: eeca-chatbot
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: eeca.sandhurstadvisory.com.my
    service: http://localhost:3000
  - service: http_status:404
```

### 7e. Start tunnel as a service

```bash
cloudflared service install
systemctl start cloudflared
systemctl enable cloudflared
```

✅ Your chatbot is now live at `https://eeca.sandhurstadvisory.com.my`

---

## Updating the App

When you push new code to GitHub:

```bash
ssh root@YOUR_VPS_IP
cd /opt/chatbot
git pull
docker compose up -d --build
```

---

## Useful Commands

| Command | What It Does |
|---------|-------------|
| `docker compose ps` | Check if services are running |
| `docker compose logs chatbot` | View app logs |
| `docker compose logs db` | View database logs |
| `docker compose down` | Stop everything |
| `docker compose up -d --build` | Rebuild and restart |
| `docker compose restart chatbot` | Restart app only |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | `docker compose logs chatbot` — check for errors |
| Port 3000 blocked | `ufw allow 3000` |
| Database connection error | `docker compose logs db` — check PostgreSQL |
| Out of memory | Upgrade VPS to 2 GB RAM |
| Tunnel not working | `systemctl restart cloudflared` |
