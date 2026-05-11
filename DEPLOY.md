# 🚀 VPS Deployment Guide — VPS Malaysia

Step-by-step guide to deploy the EECA Chatbot on a VPS Malaysia PLUS server.

---

## Server Details

| Setting | Value |
|---------|-------|
| **Provider** | VPS Malaysia |
| **Plan** | PLUS (RM 54.90/mo) |
| **OS** | Debian 13 |
| **RAM** | 2 GB (+1 core free upgrade available) |
| **CPU** | 3 cores vCPU |
| **Storage** | 60 GB NVMe SSD |
| **Bandwidth** | 3 TB |
| **IP** | Dedicated |
| **Control Panel** | [vps2.vpsmalaysia.com.my](https://vps2.vpsmalaysia.com.my/) |

---

## Step 1: Connect to Your VPS

Open PowerShell on your PC:

```bash
# First time (default port 22)
ssh root@YOUR_VPS_IP

# After port change (Step 6a)
ssh -p 2222 root@YOUR_VPS_IP
```

Enter the root password from your welcome email.

> ⚠️ **Important:** After completing Step 6a, always use `-p 2222` (or your chosen port) to connect.

---

## Step 2: Update System & Install Docker

```bash
apt update && apt upgrade -y && curl -fsSL https://get.docker.com | sh && apt install -y docker-compose-plugin git && docker --version
```

Wait ~2 minutes. You should see `Docker version 2x.x.x` at the end.

---

## Step 3: Clone the Repo

```bash
cd /opt && git clone https://github.com/izzunmustaqim/Compliance-Readiness-Assessment-Tool.git chatbot && cd chatbot
```

---

## Step 4: Create Environment File

```bash
nano .env.local
```

Paste your environment variables:

```env
# AI Provider
OPENAI_API_KEY=your_openai_api_key

# Backup AI Provider
GROQ_API_KEY=your_groq_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## Step 5: Build & Run

```bash
docker compose up -d --build
```

Wait ~5 minutes for the build. Then check:

```bash
docker compose ps
```

Your app is now running at `http://YOUR_VPS_IP:3000`

---

## Step 6: Secure Your Server

> ⚠️ **Do this immediately after first login.** Port 22 is the #1 target for brute-force attacks.

### 6a. Change SSH Port (Critical)

```bash
nano /etc/ssh/sshd_config
```

Find the line `#Port 22` or `Port 22` and change it to:

```
Port 2222
```

Save: `Ctrl+X` → `Y` → `Enter`

Then allow the new port and restart SSH:

```bash
apt install -y ufw && ufw allow 2222/tcp && systemctl restart sshd
```

> ⚠️ **Do NOT close this session yet!** Open a **second terminal** and test:
> ```bash
> ssh -p 2222 root@YOUR_VPS_IP
> ```
> Only proceed if the new connection works.

To verify the port was changed:

```bash
grep -i "^Port" /etc/ssh/sshd_config
# Should output: Port 2222
```

### 6b. Change Root Password

```bash
passwd
```

### 6c. Enable Firewall

```bash
ufw allow 3000 && ufw deny 22 && ufw enable
```

Type `y` when asked. This blocks all ports except SSH (2222) and the chatbot (3000).

---

## Step 7: Set Up Custom Domain (Optional)

If you have a domain (e.g. `sandhurstadvisory.com.my`):

### 7a. Install Cloudflare Tunnel

```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared bookworm main" | tee /etc/apt/sources.list.d/cloudflared.list
apt update && apt install cloudflared -y
```

### 7b. Login & Create Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create eeca-chatbot
cloudflared tunnel route dns eeca-chatbot eeca.sandhurstadvisory.com.my
```

### 7c. Configure Tunnel

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

### 7d. Start Tunnel as Service

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
ssh -p 2222 root@YOUR_VPS_IP
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
| `docker compose down` | Stop everything |
| `docker compose up -d --build` | Rebuild and restart |
| `docker compose restart chatbot` | Restart app only |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | `docker compose logs chatbot` — check for errors |
| Port 3000 blocked | `ufw allow 3000` |
| Can't SSH after port change | Use VPS control panel VNC to fix `/etc/ssh/sshd_config` |
| Out of memory | `docker compose down` then `docker compose up -d` |
| Tunnel not working | `systemctl restart cloudflared` |
| Need to rebuild | `docker compose up -d --build` |
| Check SSH port | `grep -i "^Port" /etc/ssh/sshd_config` |
| Check disk space | `df -h` |
| Check memory usage | `free -m` |

---

## VPS Control Panel

| Setting | Value |
|---------|-------|
| **URL** | [vps2.vpsmalaysia.com.my](https://vps2.vpsmalaysia.com.my/) |
| **Features** | Start, Reboot, Shutdown, Reset Password, VNC |
| **Support** | Open ticket at VPS Malaysia |
