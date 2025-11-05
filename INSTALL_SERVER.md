# Installing Web Crawler Node in Server-Hosted n8n

If you're running n8n on a server or via Docker (accessible via subdomain), follow these instructions to add the Web Crawler node.

## Method 1: Install as npm Package in n8n (Recommended for Docker/Server)

### For Docker-based n8n:

1. **Access your n8n Docker container:**
   ```bash
   docker exec -it <n8n-container-name> /bin/sh
   ```

2. **Navigate to the custom nodes directory:**
   ```bash
   cd /home/node/.n8n/custom
   ```

3. **Copy or clone this project to the container:**
   ```bash
   # If copying from host machine
   docker cp /path/to/n8n-web-crawler <container-name>:/home/node/.n8n/custom/
   ```

4. **Install dependencies inside the container:**
   ```bash
   cd /home/node/.n8n/custom/n8n-web-crawler
   npm install
   npx playwright install chromium
   npm run build
   ```

5. **Restart n8n container:**
   ```bash
   exit
   docker restart <n8n-container-name>
   ```

### For Standard Server Installation:

1. **Navigate to n8n's custom nodes directory:**
   ```bash
   cd ~/.n8n/custom
   ```

2. **Clone or copy the crawler:**
   ```bash
   # Option A: Clone the repository
   git clone <your-repo-url> n8n-web-crawler

   # Option B: Copy the directory
   cp -r /path/to/n8n-web-crawler ./n8n-web-crawler
   ```

3. **Install and build:**
   ```bash
   cd n8n-web-crawler
   npm install
   npx playwright install chromium
   npm run build
   ```

4. **Restart n8n:**
   ```bash
   # If using systemd
   sudo systemctl restart n8n

   # If using PM2
   pm2 restart n8n

   # If running manually
   # Stop the current process and start again
   n8n start
   ```

---

## Method 2: Install as Community Package (Alternative)

If you want to install it as a community package:

1. **Ensure community packages are enabled in n8n:**
   - Go to n8n Settings
   - Navigate to "Community Nodes"
   - Enable community nodes if not already enabled

2. **Package and publish (if publishing to npm):**
   ```bash
   npm publish
   ```

3. **Install in n8n UI:**
   - Go to Settings → Community Nodes
   - Click "Install"
   - Enter: `n8n-web-crawler`

---

## Method 3: Use HTTP API Instead (Easiest)

If installing the custom node is difficult, use the HTTP API approach:

### Step 1: Deploy the API Server

**Option A: On the same server as n8n**
```bash
cd /path/to/n8n-web-crawler
npm install
npx playwright install chromium
npm run build

# Run with PM2 for production
pm2 start dist/examples/api-server.js --name web-crawler-api
pm2 save
```

**Option B: Using Docker Compose**
Use the provided `docker-compose.yml`:
```bash
cd /path/to/n8n-web-crawler
docker-compose up -d
```

This starts both the crawler API and n8n together.

### Step 2: Configure n8n HTTP Request Node

In your n8n workflow:

1. Add an "HTTP Request" node
2. Configure it:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/crawl` (or your server IP)
   - **Authentication**: None (add if needed)
   - **Body Content Type**: JSON
   - **Specify Body**: Using Fields Below
   - **Body Parameters**:
     ```json
     {
       "url": "{{ $json.url }}",
       "options": {
         "headless": true,
         "timeout": 30000,
         "respectRobotsTxt": true,
         "rateLimit": {
           "points": 5,
           "duration": 10
         }
       }
     }
     ```

---

## Verification Steps

After installation, verify the node is available:

1. **Open n8n in your browser**
2. **Create a new workflow**
3. **Click the "+" button to add a node**
4. **Search for "Web Crawler"**
5. **You should see it appear in the list**

If you **don't see it**:

### Troubleshooting Checklist

□ Check n8n logs for errors:
```bash
# Docker
docker logs <n8n-container-name>

# Systemd
journalctl -u n8n -f

# PM2
pm2 logs n8n
```

□ Verify the files are in the correct location:
```bash
ls -la ~/.n8n/custom/n8n-web-crawler/dist/nodes/WebCrawlerNode/
```

Should contain:
- `WebCrawlerNode.node.js`
- `WebCrawlerNode.node.json`

□ Check package.json has the n8n configuration:
```bash
cat ~/.n8n/custom/n8n-web-crawler/package.json | grep -A 5 '"n8n"'
```

Should show:
```json
"n8n": {
  "n8nNodesApiVersion": 1,
  "nodes": [
    "dist/nodes/WebCrawlerNode/WebCrawlerNode.node.js"
  ]
}
```

□ Ensure community nodes are enabled:
- Check n8n Settings → Community Nodes
- Should be enabled

□ Verify dependencies are installed:
```bash
cd ~/.n8n/custom/n8n-web-crawler
ls node_modules/ | wc -l  # Should show 500+ packages
```

□ Make sure the build completed successfully:
```bash
cd ~/.n8n/custom/n8n-web-crawler
npm run build
```

Should complete without errors.

---

## For Docker Users: Complete Docker Setup

If you want to run everything in Docker, use our `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web-crawler-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - LOG_LEVEL=info
    restart: unless-stopped

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./:/home/node/.n8n/custom/n8n-web-crawler:ro
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
    restart: unless-stopped
    depends_on:
      - web-crawler-api

volumes:
  n8n_data:
```

Run with:
```bash
docker-compose up -d
```

Then use the HTTP Request method to call `http://web-crawler-api:3000/crawl`

---

## Quick Test

Once installed, test it works:

1. **Create a new workflow in n8n**
2. **Add a "Manual Trigger" node**
3. **Add the "Web Crawler" node** (or HTTP Request node)
4. **Configure it to crawl**: `https://example.com`
5. **Execute the workflow**
6. **Check the output** - you should see:
   - Title
   - HTML content
   - Links array
   - Images array
   - Metadata

---

## Need Help?

If you're still having issues:

1. Check the main **SETUP.md** for detailed troubleshooting
2. Review the n8n logs for specific error messages
3. Verify Playwright is installed: `npx playwright --version`
4. Try the HTTP API method instead - it's more portable
5. Check that n8n can access the ~/.n8n/custom directory

---

## Summary

**Best method for server/Docker n8n**: Use Method 3 (HTTP API)
- Easier to deploy
- Works with any n8n setup
- Scales independently
- Easier to update

**For local development**: Use Method 1 (Custom Node)
- Integrated in n8n UI
- Better user experience
- Direct access to all features
