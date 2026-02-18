# 🏛️ Boardroom MCP

**AI Governance-as-a-Service — Model Context Protocol Server**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-boardroom--mcp-emerald.svg)](https://www.npmjs.com/package/boardroom-mcp)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

> Give your AI agents a boardroom of advisors. Based on **Napoleon Hill's Mastermind Principle** — the idea that coordinated minds produce intelligence no single mind can achieve — digitized for AI agents.

Multi-advisor debate, institutional memory, trust scoring, and cognitive governance — all running locally on your machine.

## 📖 [Read the Full Documentation →](https://salars.net/boardroom/docs)

Complete guide covering Quick Start → Installation → 5 Tools → Protocol Files → Building Councils → Debate Protocols → Cognitive Drills → Mind Versioning → Architecture → Full System.

---

## ⚡ Quick Start

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%/Claude/claude_desktop_config.json` on Windows):

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

Restart Claude Desktop, then ask:

```
Board: Should I build a mobile app or PWA for my SaaS?
```

### Claude Code (CLI)

Create `.mcp.json` in your project root:

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

Or add it to your Claude Code settings via:
```bash
claude mcp add boardroom -- npx -y boardroom-mcp
```

### Cursor / Windsurf

Add to your MCP settings (Settings → MCP):

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

### VS Code (GitHub Copilot)

Create `.vscode/mcp.json` in your project root:

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

> Requires Copilot agent mode. Enable via Settings → Copilot → MCP.

### ChatGPT Desktop

Requires ChatGPT Plus/Pro. Go to **Settings → Developer → Connectors** and add a custom MCP server:

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

### OpenAI Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.boardroom]
type = "stdio"
command = "npx"
args = ["-y", "boardroom-mcp"]
```

Or via CLI:
```bash
codex mcp add boardroom -- npx -y boardroom-mcp
```

### Antigravity

Add to your `.mcp.json` configuration file:

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

### OpenClaw

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

---

## ✅ Verify Installation

After configuring, restart your AI client and ask:

```
Use the analyze tool: "Test — is the Boardroom working?"
```

**✅ Success:** You'll see output starting with `# Boardroom Analysis` with advisor positions from Warren Buffett, Linus Torvalds, and Marcus Aurelius.

**❌ If Claude ignores the tool:** It means the MCP server isn't loaded. Check that:
1. Your config file is in the right location (see Quick Start above)
2. The JSON is valid (no trailing commas)
3. You restarted the AI client after editing the config
4. Node.js 18+ is installed (`node --version`)

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

> **Note:** Options A and B require the package to be published to npm. If `npx` fails, use Option C (clone and build), then point your MCP config to the local build:
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
Your AI Client (Claude, Cursor, Windsurf, Antigravity, OpenClaw)
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
| `SALARSNET_ROOT` | (auto-detect) | Root project directory |

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npx boardroom-mcp` fails | Package may not be published yet — use Option C (clone and build) |
| "No advisors found" | Demo council ships with the package. Check `demo/seats.md` exists |
| Tools don't appear in Claude | Restart Claude Desktop after editing config. Check JSON syntax. |
| Claude ignores `analyze` tool | The MCP server isn't loaded. Verify config location, restart the client, and check `node --version` is 18+. |
| `ENOENT` errors | If using full protocol files, set `BOARDROOM_ROOT` to your `.ai/boardroom` path |

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
