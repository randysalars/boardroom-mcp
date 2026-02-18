#!/usr/bin/env node
/**
 * boardroom-mcp — AI Governance-as-a-Service MCP Server
 *
 * Exposes the Boardroom Cognitive Engine as 5 MCP tools:
 *   1. analyze          — Full boardroom consultation with multi-advisor synthesis
 *   2. check_governance — Task classification + advisor routing + risk assessment
 *   3. query_intelligence — Search LEDGER precedents + Wisdom Codex
 *   4. trust_lookup     — Agent trust score from 6-dimension trust vector
 *   5. report_outcome   — Log a decision outcome for learning
 *
 * MIT License — https://github.com/randysalars/boardroom-mcp
 * © 2026 SalarsNet
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { analyzeTool } from './tools/analyze.js';
import { checkGovernanceTool } from './tools/governance.js';
import { queryIntelligenceTool } from './tools/intelligence.js';
import { trustLookupTool } from './tools/trust.js';
import { reportOutcomeTool } from './tools/report.js';

const server = new McpServer({
    name: 'boardroom-mcp',
    version: '0.2.0',
});

// ── Tool 1: analyze ──────────────────────────────────────────────
server.tool(
    'analyze',
    'Run a Boardroom consultation. Routes your question to relevant advisors, loads their philosophies and decision criteria, searches institutional memory for precedents, and provides a structured analysis with mandatory tension between opposing viewpoints. Demo mode includes 3 named advisors; full protocol files unlock 450+ advisors across 38 councils.',
    {
        task: z.string().describe('The decision, question, or task to analyze'),
    },
    async ({ task }) => analyzeTool(task),
);

// ── Tool 2: check_governance ─────────────────────────────────────
server.tool(
    'check_governance',
    'Classify a task and determine which governance advisors should review it. Returns the decision type, selected advisors, risk level, and whether constitutional constraints apply. Fast classification without running the full session.',
    {
        task: z.string().describe('The task or decision to classify'),
    },
    async ({ task }) => checkGovernanceTool(task),
);

// ── Tool 3: query_intelligence ───────────────────────────────────
server.tool(
    'query_intelligence',
    'Search the Boardroom LEDGER (persistent decision memory) and Wisdom Codex for relevant precedents, past decisions, and distilled insights. Returns keyword-matched results with timestamps and excerpts. The LEDGER grows each time you use report_outcome.',
    {
        query: z.string().describe('The search query — topic, keyword, or question'),
        limit: z.number().optional().default(10).describe('Max results to return'),
    },
    async ({ query, limit }) => queryIntelligenceTool(query, limit),
);

// ── Tool 4: trust_lookup ─────────────────────────────────────────
server.tool(
    'trust_lookup',
    'Look up the trust profile for any entity (AI agent, tool, vendor, platform). Returns a 6-dimension trust vector (reliability, honesty, follow-through, outcome quality, stability, risk profile), composite score, and recommendation (trust/verify/caution/avoid). New entities return a default "unknown" profile — use report_outcome to build trust data over time.',
    {
        entity: z.string().describe('The entity to look up — an agent name, tool, vendor, or platform'),
        context: z.string().optional().describe('Optional context about how you are using this entity'),
    },
    async ({ entity, context }) => trustLookupTool(entity, context),
);

// ── Tool 5: report_outcome ───────────────────────────────────────
server.tool(
    'report_outcome',
    'Report the outcome of a decision for the Boardroom learning system. Records what happened, whether the original recommendation was followed, and what was learned. Feeds the Knowledge Flywheel and updates the Trust Oracle if an entity is specified. Returns a warning if the outcome could not be persisted to disk.',
    {
        task: z.string().describe('The original task or decision'),
        outcome: z.string().describe('What actually happened — result, success/failure, learnings'),
        followedRecommendation: z
            .boolean()
            .optional()
            .default(true)
            .describe('Whether the Boardroom recommendation was followed'),
        entity: z
            .string()
            .optional()
            .describe('Optional entity (agent, tool, vendor) whose trust profile should be updated based on this outcome'),
    },
    async ({ task, outcome, followedRecommendation, entity }) =>
        reportOutcomeTool(task, outcome, followedRecommendation, entity),
);

// ── Start Server ─────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Boardroom MCP Server failed to start:', error);
    process.exit(1);
});
