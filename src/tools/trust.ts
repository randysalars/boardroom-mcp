/**
 * trust tool — 6-dimension trust vector for AI agents.
 */

import { TRUST_ORACLE_PATH, safeReadFile, safeParseJSON, mcpSuccess, mcpError } from '../utils.js';

interface TrustProfile {
    reliability: number;
    honesty: number;
    followThrough: number;
    outcomeQuality: number;
    stability: number;
    riskProfile: number;
    interactions: number;
    lastUpdated: string;
}

interface TrustOracle {
    agents: Record<string, TrustProfile>;
}

function getRecommendation(composite: number): string {
    if (composite >= 0.85) return '✅ TRUST — High confidence, minimal oversight needed';
    if (composite >= 0.65) return '🔍 VERIFY — Good standing, periodic checks recommended';
    if (composite >= 0.45) return '⚠️ CAUTION — Elevated risk, active monitoring required';
    return '🚫 AVOID — Insufficient trust, do not delegate critical tasks';
}

export async function trustLookupTool(agentId: string) {
    try {
        const content = await safeReadFile(TRUST_ORACLE_PATH);
        const oracle = safeParseJSON<TrustOracle>(content);

        if (!oracle || !oracle.agents || !oracle.agents[agentId]) {
            const result = [
                `# Trust Lookup: ${agentId}`,
                ``,
                `**Status:** ❓ Unknown Agent`,
                ``,
                `No trust profile found for agent "${agentId}".`,
                ``,
                `This agent has not yet been evaluated by the Trust Oracle.`,
                `Use \`report_outcome()\` after interactions to build their trust profile.`,
                ``,
                `**Default Recommendation:** ${getRecommendation(0.5)}`,
            ].join('\n');

            return mcpSuccess(result);
        }

        const profile = oracle.agents[agentId];
        const composite = (
            profile.reliability * 0.25 +
            profile.honesty * 0.20 +
            profile.followThrough * 0.20 +
            profile.outcomeQuality * 0.15 +
            profile.stability * 0.10 +
            profile.riskProfile * 0.10
        );

        const result = [
            `# Trust Lookup: ${agentId}`,
            ``,
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
