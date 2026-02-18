/**
 * trust tool — 6-dimension trust vector for any entity.
 *
 * Uses shared TrustProfile/TrustOracle types from utils.ts.
 */

import {
    TRUST_ORACLE_PATH,
    safeReadFile,
    safeParseJSON,
    mcpSuccess,
    mcpError,
    TrustProfile,
    TrustOracle,
} from '../utils.js';

function getRecommendation(composite: number): string {
    if (composite >= 0.85) return '✅ TRUST — High confidence, minimal oversight needed';
    if (composite >= 0.65) return '🔍 VERIFY — Good standing, periodic checks recommended';
    if (composite >= 0.45) return '⚠️ CAUTION — Elevated risk, active monitoring required';
    return '🚫 AVOID — Insufficient trust, do not delegate critical tasks';
}

export async function trustLookupTool(entity: string, context?: string) {
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
        const composite = (
            profile.reliability * 0.25 +
            profile.honesty * 0.20 +
            profile.followThrough * 0.20 +
            profile.outcomeQuality * 0.15 +
            profile.stability * 0.10 +
            profile.riskProfile * 0.10
        );

        const result = [
            `# Trust Lookup: ${entity}`,
            ``,
            ...(context ? [`**Context:** ${context}`, ``] : []),
            `## 6-Dimension Trust Vector`,
            `| Dimension | Score | Weight |`,
            `|-----------|-------|--------|`,
            `| Reliability | ${(profile.reliability * 100).toFixed(0)}% | 25% |`,
            `| Honesty | ${(profile.honesty * 100).toFixed(0)}% | 20% |`,
            `| Follow-Through | ${(profile.followThrough * 100).toFixed(0)}% | 20% |`,
            `| Outcome Quality | ${(profile.outcomeQuality * 100).toFixed(0)}% | 15% |`,
            `| Stability | ${(profile.stability * 100).toFixed(0)}% | 10% |`,
            `| Risk Profile | ${(profile.riskProfile * 100).toFixed(0)}% | 10% |`,
            ``,
            `**Composite Score:** ${(composite * 100).toFixed(1)}%`,
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
