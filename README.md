# 🏛️ Boardroom MCP

**AI Governance-as-a-Service — Model Context Protocol Server**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-boardroom--mcp-emerald.svg)](https://www.npmjs.com/package/boardroom-mcp)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

> Give your AI agents a boardroom of advisors. Multi-advisor debate, institutional memory, trust scoring, and cognitive governance — all running locally on your machine.

## 📖 [Read the Full Documentation →](https://salars.net/boardroom/docs)

Complete guide covering Quick Start → Installation → 5 Tools → Protocol Files → Building Councils → Debate Protocols → Cognitive Drills → Mind Versioning → Architecture → Full System.

---

## ⚡ Quick Start (2 minutes)

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "boardroom": {
      "command": "npx",
      "args": ["boardroom-mcp"]
    }
  }
}
```

Then ask your agent:

```
Board: Should I build a mobile app or PWA for my SaaS?
```

That's it. The demo council of 5 advisors will analyze your question from multiple perspectives.

## 🔧 5 MCP Tools

| Tool | Purpose |
|------|---------|
| `analyze` | Full boardroom consultation with multi-advisor debate |
| `check_governance` | Task classification + severity routing |
| `query_intelligence` | Search LEDGER decisions + Wisdom Codex |
| `trust_lookup` | 6-dimension trust vector for any entity |
| `report_outcome` | Log outcomes for institutional memory |

→ [See detailed tool documentation with examples](https://salars.net/boardroom/docs#tools)

## 📦 Installation

```bash
# Option A: npx (recommended — no install needed)
npx boardroom-mcp

# Option B: Global install
npm install -g boardroom-mcp
boardroom-mcp

# Option C: Clone and build
git clone https://github.com/randysalars/boardroom-mcp.git
cd boardroom-mcp && npm install && npm run build && npm start
```

## 🏗️ Architecture

```
Your AI Client (Claude, Cursor, Windsurf)
         │ MCP Protocol (STDIO)
         │ Runs 100% on YOUR machine
         ▼
  Boardroom MCP Server
         │
         ▼
  .ai/boardroom/         ← Protocol files (the intelligence)
  ├── LEDGER.md           ← Institutional memory
  ├── BOARD_WISDOM.md     ← Distilled principles
  └── mastermind/
      ├── seats/          ← Advisor definitions
      ├── councils/       ← Expert panels
      └── protocols/      ← Debate rules
```

**Zero cost.** No API keys. No cloud. No hosting. Your AI client does the LLM processing.

## 🎯 What You Get

### Free (This Repo)
- ✅ MCP server with 5 tools
- ✅ Demo council (5 generic advisors)
- ✅ MIT license

### Full System ([salars.net/boardroom](https://salars.net/boardroom))
- 🏛️ 450+ named advisors with calibrated seat cards
- 🏛️ 38 expert councils (Tech, Business, Survival, Legal, Creative...)
- ⚔️ 5 debate resolution types
- 🧠 10 cognitive drills
- ⏳ Mind Versioning (Young Jobs vs Late Jobs)
- 🔥 Prometheus Protocol (forge new domains on the fly)
- 👁️ Meta-Observer (real-time bias detection)
- 📚 69+ LEDGER decisions as precedent library
- 📖 113+ Wisdom Codex entries
- 🎯 Smart Router (auto-detects council + severity)

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BOARDROOM_ROOT` | (auto-detect) | Path to your `.ai/boardroom` directory |
| `SALARSNET_ROOT` | (auto-detect) | Root project directory |

## 📬 Stay in the Loop

Join the Boardroom community:

- 🌐 **[Landing Page](https://salars.net/boardroom)** — Feature overview + waitlist
- 📖 **[Documentation](https://salars.net/boardroom/docs)** — Complete free → advanced guide
- 📧 **[Subscribe for Updates](https://salars.net/boardroom#waitlist)** — Get notified about new councils, protocol updates, and features
- 🐦 **[@SalarsNet](https://x.com/salaborsa)** — Follow for tips, demos, and announcements

## 🤝 Contributing

PRs welcome! Areas we'd love help with:
- Additional demo advisors
- New cognitive drill templates
- Documentation improvements
- Bug fixes

## 📄 License

[MIT](LICENSE) — Built by [SalarsNet](https://salars.net)
