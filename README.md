# 🏛️ Boardroom MCP

**AI Governance-as-a-Service — Model Context Protocol Server**

Give your AI agents a boardroom of 450+ advisors across 38 expert councils. Structured debate. Cognitive drills. Institutional memory that compounds with every decision.

[![npm version](https://img.shields.io/npm/v/boardroom-mcp)](https://www.npmjs.com/package/boardroom-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)

---

## What is this?

The Boardroom MCP server gives your AI agent access to a **multi-advisor decision engine**. Instead of your agent making decisions alone, it routes questions to relevant expert councils, generates mandatory tension between opposing viewpoints, and synthesizes recommendations backed by precedent memory.

### Key Features

| Feature | Description |
|---------|-------------|
| **450+ Named Advisors** | Calibrated expertise across business, tech, philosophy, sciences, and more |
| **38 Expert Councils** | From Business Strategy to AI & Robotics to Consciousness & Spirituality |
| **35+ Session Modes** | Sprint, Code, Debug, Shadow, Crisis, Copy, Funnel, Campaign, and more |
| **Structured Debate Protocol** | 5 resolution types when advisors disagree |
| **Meta-Observer** | Watches for bias, authority worship, and cognitive drift |
| **Mind Versioning** | Invoke any advisor at different life stages |
| **Prometheus Protocol** | Forge ad-hoc domain intelligence on the fly |
| **Institutional Memory** | LEDGER + Wisdom Codex persist across sessions |

### 5 MCP Tools

| Tool | Description |
|------|-------------|
| `analyze()` | Full boardroom consultation with multi-advisor synthesis |
| `check_governance()` | Task classification + advisor routing + risk assessment |
| `query_intelligence()` | Search persistent LEDGER and Wisdom Codex for precedents |
| `trust_lookup()` | 6-dimension trust vector for any AI agent |
| `report_outcome()` | Feed the knowledge flywheel — log what actually happened |

---

## Quick Start

### Claude Desktop / Cursor

Add to your `claude_desktop_config.json`:

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

### Manual Installation

```bash
npm install -g boardroom-mcp
boardroom-mcp
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BOARDROOM_ROOT` | `~/.ai/boardroom` | Path to boardroom protocol files |
| `BOARDROOM_TRUST_PATH` | `~/.boardroom/trust-oracle.json` | Trust oracle data |

---

## How It Works

```
┌─────────────────────────────────────────────┐
│           Your AI Agent (Claude, etc.)       │
│                                             │
│  "Should I migrate to microservices?"       │
└──────────────────┬──────────────────────────┘
                   │ MCP (STDIO)
                   ▼
┌─────────────────────────────────────────────┐
│          Boardroom MCP Server               │
│                                             │
│  1. Classify → Technology + Strategy        │
│  2. Route → Technology Council + Keystone   │
│  3. Load Advisors → Torvalds, Knuth, Bezos  │
│  4. Find Precedents → LEDGER search         │
│  5. Apply Tension → Simplicity vs Scale     │
│  6. Synthesize → Omega Truth                │
└──────────────────┬──────────────────────────┘
                   │ reads local files
                   ▼
┌─────────────────────────────────────────────┐
│     ~/.ai/boardroom/ (your protocol files)  │
│                                             │
│  mastermind/                                │
│  ├── SYSTEM_PROMPT.md                       │
│  ├── COGNITIVE_DOSSIERS.md                  │
│  ├── DEBATE_PROTOCOL.md                     │
│  ├── keystone/seats.md                      │
│  ├── business/seats.md                      │
│  ├── technology/seats.md                    │
│  └── ... (38 councils)                      │
│  LEDGER.md                                  │
│  BOARD_WISDOM.md                            │
└─────────────────────────────────────────────┘
```

The MCP server runs **100% locally on your machine**. No API keys, no cloud dependency, no data leaves your system.

---

## Getting Started with Protocol Files

The MCP server reads your boardroom protocol files from `~/.ai/boardroom/`. A demo council is included to get you started, but the full system with 450+ advisors, 38 councils, cognitive dossiers, debate protocols, and institutional memory is available at:

### 🌐 [salars.net/boardroom](https://salars.net/boardroom)

Join the waitlist for the full Boardroom Cognitive Engine.

---

## Architecture

- **Transport**: STDIO (runs as a local process — zero network)
- **Protocol**: Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **Data**: Reads markdown/JSON files from your local filesystem
- **Cost**: $0 — you pay only for your LLM subscription
- **Security**: No data ever leaves your machine

---

## Demo Council

This package includes a small demo council (`demo/`) with 5 sample advisors so you can test the tools immediately:

| Advisor | Domain | Style |
|---------|--------|-------|
| **The Strategist** | Business strategy | Analytical, data-driven |
| **The Engineer** | Technical architecture | First-principles, pragmatic |
| **The Skeptic** | Risk assessment | Contrarian, adversarial |
| **The Visionary** | Innovation & trends | Ambitious, forward-looking |
| **The Guardian** | Ethics & governance | Values-first, protective |

Run `analyze("Should I launch this feature?")` to see them in action.

---

## Contributing

Issues and PRs welcome. The MCP server adapter is MIT-licensed and community-driven.

For protocol file contributions (new councils, advisor calibrations, drill improvements), please reach out at [salars.net](https://salars.net).

---

## License

MIT — see [LICENSE](LICENSE)

Built by [SalarsNet](https://salars.net) 🏛️
