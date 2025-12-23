# Claude Desktop MCP Setup for n8n

This configuration connects Claude Desktop to your self-hosted n8n instance at `https://n8n.transformatsioon.ee`.

## Step 1: Generate n8n API Key

1. Open your n8n instance: https://n8n.transformatsioon.ee
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Give it a name (e.g., "Claude Desktop MCP")
5. Copy the API key (you won't be able to see it again!)

## Step 2: Install the Configuration

### Find Your Config File Location

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Update the Configuration

1. Open the config file in a text editor (VS Code recommended for JSON validation)
2. Copy the contents of `claude_desktop_config.json` from this repository
3. Replace `YOUR_API_KEY_HERE` with your actual n8n API key
4. Save the file

**Example:**
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "n8n-mcp"
      ],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://n8n.transformatsioon.ee",
        "N8N_API_KEY": "n8n_api_1234567890abcdef"
      }
    }
  }
}
```

## Step 3: Restart Claude Desktop

**Important:** Completely quit Claude Desktop and restart it for the changes to take effect.

- **macOS**: Cmd+Q to quit, then reopen
- **Windows**: Right-click system tray icon → Quit, then reopen
- **Linux**: Close all windows and restart

## Verify Connection

After restarting Claude Desktop, you should see the n8n MCP server available. You can verify by asking Claude to interact with your n8n workflows.

## Troubleshooting

- **Config not loading**: Make sure your JSON is valid (no trailing commas, proper quotes)
- **Connection fails**: Verify your API key is correct and hasn't expired
- **Command not found**: The first time you connect, it may take a moment to download the MCP server package via npx

## Security Note

Keep your `claude_desktop_config.json` file secure as it contains your n8n API key. Never commit this file to public repositories.
