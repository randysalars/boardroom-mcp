# 🏛️ Boardroom MCP

**AI Governance-as-a-Service — Model Context Protocol Server**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-boardroom--mcp-emerald.svg)](https://www.npmjs.com/package/boardroom-mcp)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

> Give your AI agents a boardroom of advisors. Based on **Napoleon Hill's Mastermind Principle** — the idea that coordinated minds produce intelligence no single mind can achieve — digitized for AI agents.

Multi-advisor debate, institutional memory, trust scoring, and cognitive governance — all running locally on your machine.

## 📖 [Read the Full Documentation →](https://salars.net/boardroom/docs)

Complete guide covering Quick Start → Installation → 5 Tools → Use Cases → Protocol Files → Building Councils → Debate Protocols → Cognitive Drills → Mind Versioning → Architecture → Full System.

---

## ⚡ Quick Start — Pick Your Platform

> **Prerequisites:** Node.js 18+ must be installed. Check with `node --version`.

---

### 🟣 Claude Desktop

**Step 1:** Open your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Step 2:** Paste this (create the file if it doesn't exist):

```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Step 3:** Restart Claude Desktop completely (quit and reopen).

**Step 4: Test it** — type this in the chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**Step 5: See what's available** — type this in the chat:
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🟢 Claude Code (CLI)

**Option A — One command (recommended):**
```bash
claude mcp add boardroom -- npx -y boardroom-mcp
```

**Option B — Config file:** Create `.mcp.json` in your project root:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Test it** — type this in Claude Code:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🔵 Cursor

**Step 1:** Open **Settings → MCP** (or create `.cursor/mcp.json` in your project root)

**Step 2:** Add this server config:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Step 3:** Restart Cursor.

**Test it** — type in Cursor chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🟡 Windsurf

**Step 1:** Open **Settings → MCP** or create `.windsurf/mcp.json` in your project root.

**Step 2:** Add this server config:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Step 3:** Restart Windsurf.

**Test it** — type in Windsurf chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🔷 VS Code (GitHub Copilot)

> Requires GitHub Copilot with agent mode enabled.

**Step 1:** Enable MCP: **Settings → Copilot → MCP** (toggle on).

**Step 2:** Create `.vscode/mcp.json` in your project root:
```json
{
  "servers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

> ⚠️ **Note:** VS Code uses `"servers"` — NOT `"mcpServers"`. This is different from all other platforms.

**Step 3:** Reload VS Code window (Ctrl+Shift+P → "Reload Window").

**Test it** — type in Copilot Chat (Agent mode):
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### ⚫ ChatGPT Desktop

> Requires ChatGPT Plus or Pro subscription.

**Step 1:** Open ChatGPT Desktop → **Settings → Developer → Connectors**.

**Step 2:** Click "Add Custom MCP Server" and paste:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Step 3:** Enable the "boardroom" connector in your chat.

**Test it** — type in the chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🟠 OpenAI Codex CLI

**Option A — One command (recommended):**
```bash
codex mcp add boardroom -- npx -y boardroom-mcp
```

**Option B — Config file:** Add to `~/.codex/config.toml`:
```toml
[mcp_servers.boardroom]
type = "stdio"
command = "npx"
args = ["-y", "boardroom-mcp"]
```

**Test it** — type in Codex CLI:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### 🔴 Antigravity

Create `.mcp.json` in your workspace root:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["-y", "boardroom-mcp"]
    }
  }
}
```

**Test it** — type in the chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

### ⚪ OpenClaw

Add to your `~/.openclaw/openclaw.json` under the gateway's `mcpServers` key:
```json
{
  "gateway": {
    "mcpServers": {
      "boardroom": {
        "command": "npx",
        "args": ["-y", "boardroom-mcp"]
      }
    }
  }
}
```

**Test it** — type in the chat:
```
Use the analyze tool with task: "Test — is the Boardroom working?"
```

**See what's available:**
```
What Boardroom MCP tools do I have access to? List all 5 tools with a one-line description of each.
```

---

## ✅ What Success Looks Like

When the test prompt works, you'll see output like:

```
# Boardroom Analysis

## Advisors Consulted
- **Warren Buffett** (Business Strategy): [their position]
- **Linus Torvalds** (Technology): [their position]
- **Marcus Aurelius** (Values & Ethics): [their position]

## Verdict
[synthesized recommendation]

## Recommended Actions
1. [action item]
2. [action item]
```

If you see this, **it's working.** Try a real question next:

```
Use the analyze tool with task: "Should I raise my SaaS price from $29 to $49?"
```

---

## 📖 Quick Command Reference

Copy-paste these prompts into your AI chat to use each tool:

| What You Want | Prompt to Type |
|---------------|----------------|
| **Full analysis** | `Use the analyze tool with task: "Should I build feature X or Y?"` |
| **Risk check** | `Use the check_governance tool with task: "Deploy to production on Friday"` |
| **Search past decisions** | `Use the query_intelligence tool with query: "pricing strategy"` |
| **Trust assessment** | `Use the trust_lookup tool for entity: "Stripe" with context: "payment processing"` |
| **Log an outcome** | `Use the report_outcome tool with decision: "Raised prices 30%" and outcome: "Revenue up 22%"` |
| **List all tools** | `What Boardroom MCP tools do I have? List all 5 with descriptions.` |

---

## 📦 Alternative Installation Methods

```bash
# Option A: npx (used by MCP configs above — no global install needed)
npx -y boardroom-mcp

# Option B: Global install
npm install -g boardroom-mcp
boardroom-mcp

# Option C: Clone and build (for development/contributing)
git clone https://github.com/randysalars/boardroom-mcp.git
cd boardroom-mcp && npm install && npm run build
```

> **Note:** If `npx` fails, use Option C (clone and build), then point your MCP config to the local build:
> ```json
> {
>   "mcpServers": {
>     "boardroom": {
>       "command": "node",
>       "args": ["/path/to/boardroom-mcp/dist/index.js"]
>     }
>   }
> }
> ```

---

## 🔧 5 MCP Tools

| Tool | Purpose |
|------|---------|
| `analyze` | Full boardroom consultation with multi-advisor debate |
| `check_governance` | Task classification + severity routing |
| `query_intelligence` | Search LEDGER decisions + Wisdom Codex |
| `trust_lookup` | 6-dimension trust vector for any entity |
| `report_outcome` | Log outcomes for institutional memory |

→ [See detailed tool documentation with examples](https://salars.net/boardroom/docs#tools)

---

## 🏗️ Architecture

```
Your AI Client (Claude, Cursor, Windsurf, VS Code, ChatGPT, Codex, Antigravity, OpenClaw)
         │ MCP Protocol (STDIO)
         │ Runs 100% on YOUR machine
         ▼
  Boardroom MCP Server
         │
         ├── demo/              ← Demo council (Buffett, Torvalds, Aurelius)
         │
         ▼
  ~/.ai/boardroom/          ← Full protocol files (optional upgrade)
  ├── LEDGER.md              ← Institutional memory
  ├── BOARD_WISDOM.md        ← Distilled principles
  └── mastermind/
      ├── seats/             ← Advisor definitions
      ├── councils/          ← Expert panels
      └── protocols/         ← Debate rules
```

**Zero cost.** No API keys. No cloud. No hosting. Your AI client does the LLM processing.

---

## 🎯 What You Get

### Free (This Repo)
- ✅ MCP server with 5 tools
- ✅ Demo council (3 named advisors: Warren Buffett, Linus Torvalds, Marcus Aurelius)
- ✅ MIT license

### Full System ([salars.net/boardroom](https://salars.net/boardroom))
- 🏛️ 450+ named advisors with calibrated seat cards (Buffett, Torvalds, Aurelius...)
- 🏛️ 38 expert councils (Tech, Business, Survival, Legal, Creative...)
- ⚔️ 5 debate resolution types
- 🧠 10 cognitive drills
- ⏳ Mind Versioning (Young Jobs vs Late Jobs)
- 🔥 Prometheus Protocol (forge new domains on the fly)
- 👁️ Meta-Observer (real-time bias detection)
- 📚 69+ LEDGER decisions as precedent library
- 📖 113+ Wisdom Codex entries
- 🎯 Smart Router (auto-detects council + severity)

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BOARDROOM_ROOT` | `~/.ai/boardroom` | Path to your full protocol files directory |
| `BOARDROOM_TRUST_PATH` | `~/.boardroom/trust-oracle.json` | Path to trust oracle data file |

---

## 🔍 Troubleshooting

### The AI ignores my prompt and doesn't use the tool

**This is the #1 issue.** It means the MCP server isn't loaded. Fix it:

1. **Did you restart?** Every platform requires a restart after editing the config. Quit completely and reopen.
2. **Is the config in the right file?** Double-check the file path for your platform (see Quick Start above).
3. **Is the JSON valid?** No trailing commas, no comments. Use [jsonlint.com](https://jsonlint.com) to validate.
4. **Is Node.js 18+ installed?** Run `node --version` in your terminal. Must be 18.0.0 or higher.
5. **VS Code users:** You need `"servers"` not `"mcpServers"` — VS Code uses a different format.

### The AI says "boardroom-mcp not found" or npx fails

```bash
# Verify the package exists
npm view boardroom-mcp version

# If that works but npx doesn't, clear cache:
npx clear-npx-cache
npx -y boardroom-mcp

# Nuclear option — install globally:
npm install -g boardroom-mcp
```

Then update your config to use the global install:
```json
{
  "mcpServers": {
    "boardroom": {
      "command": "boardroom-mcp"
    }
  }
}
```

### "No advisors found" in the output

The demo council file isn't being found. This means the package installed but can't find `demo/seats.md`.

```bash
# Check if the demo file exists in the package
npx -y boardroom-mcp --help 2>/dev/null
ls $(npm root -g)/boardroom-mcp/demo/
```

If the demo directory is missing, reinstall: `npm install -g boardroom-mcp`

### ENOENT errors

You're pointing at a `BOARDROOM_ROOT` directory that doesn't exist:

```bash
# Check what path it's looking for
echo $BOARDROOM_ROOT

# Create it or unset the variable:
unset BOARDROOM_ROOT  # falls back to demo council
```

### Tools appear but return errors

```bash
# Test the server directly in your terminal:
npx -y boardroom-mcp

# If it starts without errors, the MCP server works.
# The issue is in your AI client's connection to it.
# Try removing and re-adding the MCP config.
```

### Claude Code specific: "MCP server failed to start"

```bash
# Remove and re-add:
claude mcp remove boardroom
claude mcp add boardroom -- npx -y boardroom-mcp

# Verify it's registered:
claude mcp list
```

### Permission errors on macOS

```bash
# If npx can't write to the cache:
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### Platform-specific config cheat sheet

| Platform | Config File | Key Name | Restart Method |
|----------|------------|----------|----------------|
| Claude Desktop | `claude_desktop_config.json` | `mcpServers` | Quit + reopen app |
| Claude Code | `.mcp.json` or `claude mcp add` | `mcpServers` | Auto-reloads |
| Cursor | `.cursor/mcp.json` or Settings → MCP | `mcpServers` | Restart Cursor |
| Windsurf | `.windsurf/mcp.json` or Settings → MCP | `mcpServers` | Restart Windsurf |
| VS Code | `.vscode/mcp.json` | ⚠️ `servers` | Reload Window |
| ChatGPT Desktop | Settings → Developer → Connectors | `mcpServers` | Toggle connector |
| Codex CLI | `~/.codex/config.toml` or `codex mcp add` | `mcp_servers` (TOML) | Auto-reloads |
| Antigravity | `.mcp.json` | `mcpServers` | Auto-reloads |
| OpenClaw | `openclaw.json` | `gateway.mcpServers` | Restart gateway |

---

## 📬 Stay in the Loop

- 🌐 **[Landing Page](https://salars.net/boardroom)** — Feature overview + waitlist
- 📖 **[Documentation](https://salars.net/boardroom/docs)** — Complete free → advanced guide
- 📧 **[Subscribe for Updates](https://salars.net/boardroom#waitlist)** — New councils, protocol updates, features
- 🐦 **[@SalarsNet](https://x.com/salaborsa)** — Tips, demos, and announcements

---

## 🤝 Contributing

PRs welcome! Areas we'd love help with:
- Additional demo advisors
- New cognitive drill templates
- Documentation improvements
- Bug fixes

---

## 📄 License

[MIT](LICENSE) — Built by [SalarsNet](https://salars.net)
