# Changelog

All notable changes to Boardroom MCP will be documented in this file.

## [0.2.2] - 2026-10-01

### Fixed
- Sanitize `task`/`outcome`/`entity` before LEDGER writes — embedded markdown headings can no longer forge sessions that `query_intelligence` serves as precedents
- Reject trust-oracle entity names that collide with `Object.prototype` members (`__proto__`, `constructor`, …); lookups now use own-property checks so inherited keys can't yield NaN% profiles
- Validate the `query_intelligence` `limit` parameter (positive integer, capped at 50)
- Serialize trust-oracle read-modify-write cycles so concurrent tool calls can't lose updates
- `package-lock.json` now matches `package.json` (lockfile was stale at 0.2.0)

### Changed
- `npm audit fix` — resolved all 6 high, 1 moderate, and 2 low advisories via semver-compatible bumps (incl. `tsx` 4.23.15 → `esbuild` 0.28.2)
- Tests run against a temporary data directory; the real `~/.ai/boardroom/` is no longer touched

### Added
- Unit tests for `validateInput`, `classifySeverity`, `sanitizeForLedger`, and trust-oracle logic, plus regression tests for the injection and prototype-key fixes
- GitHub Actions CI (typecheck + tests)

## [0.2.1] - 2026-02-18

### Fixed
- Wire `context` parameter through `trust_lookup` (was silently ignored)
- Unify wisdom search logic — shared `parseWisdomEntries()` eliminates inconsistent matching
- Deduplicate classification logic — single `classifyTask()` source of truth across tools
- Add short-keyword warning when all search terms are ≤ 2 characters
- `report_outcome` now updates Trust Oracle via `updateTrustOracle()` with EMA scoring

### Added
- `src/types.ts` — 10 typed interfaces with JSDoc (`McpToolResponse`, `TrustProfile`, `AdvisorDetails`, etc.)
- `computeCompositeScore()` with `TRUST_WEIGHTS` constant (eliminates magic numbers)
- `validateInput()` — input length limit (10K chars) and null byte stripping on all tool inputs
- Named constants: `TRUST_EMA_ALPHA`, `MIN_KEYWORD_LENGTH`, `PRECEDENT_EXCERPT_LENGTH`, etc.
- `clamp01()`, `pct()`, `pctDecimal()` helpers
- Explicit `Promise<McpToolResponse>` return types on all 5 exported tool functions
- `@module` JSDoc tags and full `@param`/`@returns` annotations

### Removed
- Stale nested `boardroom-mcp/boardroom-mcp/` directory (dead v0.1.0 code)

## [0.2.0] - 2026-02-17

### Changed
- **Demo council upgraded:** Replaced 5 generic advisors (The Strategist, The Engineer, etc.) with 3 named experts:
  - **Warren Buffett** — Business strategy, moats, long-term value
  - **Linus Torvalds** — Technology architecture, simplicity, maintainability
  - **Marcus Aurelius** — Values alignment, Stoic judgment, principled action
- Each advisor now includes calibrated decision criteria, signature questions, tension areas, and veto powers

## [0.1.0] - 2026-02-17

### Added
- Initial release with 5 MCP tools:
  - `analyze` — Full boardroom consultation with multi-advisor debate
  - `check_governance` — Task classification + severity routing
  - `query_intelligence` — Search LEDGER decisions + Wisdom Codex
  - `trust_lookup` — 6-dimension trust vector for any entity
  - `report_outcome` — Log outcomes for institutional memory
- Demo council with 5 generic advisors
- Installation support for Claude Desktop, Claude Code, Cursor, Windsurf, Antigravity, OpenClaw
- MIT license
