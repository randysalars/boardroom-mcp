/**
 * trust tool — 6-dimension trust vector for any entity.
 *
 * Provides composite scoring with weighted dimensions and
 * actionable recommendations based on trust thresholds.
 *
 * @module tools/trust
 */

import {
    TRUST_ORACLE_PATH,
    safeReadFile,
    safeParseJSON,
    mcpSuccess,
    mcpError,
} from '../utils.js';
import type { McpToolResponse, TrustOracle } from '../types.js';
import { TRUST_WEIGHTS, computeCompositeScore } from '../types.js';

/**
 * Map a composite trust score to a human-readable recommendation.
 *
 * @param composite - Weighted composite score in [0, 1].
 * @returns Emoji + recommendation string.
 */
function getRecommendation(composite: number): string {
    if (composite >= 0.85) return '✅ TRUST — High confidence, minimal oversight needed';
    if (composite >= 0.65) return '🔍 VERIFY — Good standing, periodic checks recommended';
    if (composite >= 0.45) return '⚠️ CAUTION — Elevated risk, active monitoring required';
    return '🚫 AVOID — Insufficient trust, do not delegate critical tasks';
}

/**
 * Format a percentage from a 0–1 score.
 *
 * @param score - Score in [0, 1].
 * @returns Formatted string like "75%".
 */
function pct(score: number): string {
    return `${(score * 100).toFixed(0)}%`;
}

/**
 * Format a percentage with one decimal from a 0–1 score.
 *
 * @param score - Score in [0, 1].
 * @returns Formatted string like "72.5%".
 */
function pctDecimal(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
}

/**
 * Look up the trust profile for an entity.
 *
 * @param entity - Agent, tool, vendor, or platform name.
 * @param context - Optional usage context shown in the output.
 * @returns MCP response with the trust vector or "unknown" guidance.
 */
export async function trustLookupTool(entity: string, context?: string): Promise<McpToolResponse> {
    try {
        const content = await safeReadFile(TRUST_ORACLE_PATH);
        const oracle = content ? safeParseJSON<TrustOracle>(content) : null;

        if (!oracle || !oracle.agents || !oracle.agents[entity]) {
            const hasOracleFile = !!content;

            const result = [
                `# Trust Lookup: ${entity}`,
                ``,
                `**Status:** ❓ Unknown Entity`,
                ...(context ? [`**Context:** ${context}`] : []),
                ``,
                `No trust profile found for "${entity}".`,
                ``,
                hasOracleFile
                    ? `The Trust Oracle file exists but has no data for this entity.`
                    : `The Trust Oracle file does not exist yet at \`${TRUST_ORACLE_PATH}\`.`,
                ``,
                `**How trust profiles are built:**`,
                `- Use \`report_outcome()\` after interactions with this entity`,
                `- Each outcome contributes to the 6-dimension trust vector`,
                `- Trust scores update automatically as evidence accumulates`,
                ``,
                `**Default Recommendation:** ${getRecommendation(0.5)}`,
                ``,
                `> **Tip:** To bootstrap trust data, create a JSON file at \`${TRUST_ORACLE_PATH}\` with the structure:`,
                `> \`\`\`json`,
                `> { "agents": { "${entity}": { "reliability": 0.5, "honesty": 0.5, "followThrough": 0.5, "outcomeQuality": 0.5, "stability": 0.5, "riskProfile": 0.5, "interactions": 0, "lastUpdated": "${new Date().toISOString()}" } } }`,
                `> \`\`\``,
            ].join('\n');

            return mcpSuccess(result);
        }

        const profile = oracle.agents[entity];
        const composite = computeCompositeScore(profile);

        const result = [
            `# Trust Lookup: ${entity}`,
            ``,
            ...(context ? [`**Context:** ${context}`, ``] : []),
            `## 6-Dimension Trust Vector`,
            `| Dimension | Score | Weight |`,
            `|-----------|-------|--------|`,
            `| Reliability | ${pct(profile.reliability)} | ${pct(TRUST_WEIGHTS.reliability)} |`,
            `| Honesty | ${pct(profile.honesty)} | ${pct(TRUST_WEIGHTS.honesty)} |`,
            `| Follow-Through | ${pct(profile.followThrough)} | ${pct(TRUST_WEIGHTS.followThrough)} |`,
            `| Outcome Quality | ${pct(profile.outcomeQuality)} | ${pct(TRUST_WEIGHTS.outcomeQuality)} |`,
            `| Stability | ${pct(profile.stability)} | ${pct(TRUST_WEIGHTS.stability)} |`,
            `| Risk Profile | ${pct(profile.riskProfile)} | ${pct(TRUST_WEIGHTS.riskProfile)} |`,
            ``,
            `**Composite Score:** ${pctDecimal(composite)}`,
            `**Interactions:** ${profile.interactions}`,
            `**Last Updated:** ${profile.lastUpdated}`,
            ``,
            `**Recommendation:** ${getRecommendation(composite)}`,
        ].join('\n');

        return mcpSuccess(result);
    } catch (error) {
        return mcpError(`Trust lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
